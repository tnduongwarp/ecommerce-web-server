import user from './user.js';
import auth from './auth.js';
import refreshToken from './refreshToken.js';
import forgotPassWord from './forgot-pw.js';
import category from './category.js';
import product from './product.js';
import cart from './cart.js';
import order from './order.js';
import messsage from './message.js'
import seller from'./seller.js';
import upload from '../utils/saveFile.js';
import saveFile from '../service/saveFile.js';
import authorization from '../utils/authorize.js';
import moment from 'moment';
import Order from '../models/order.js';
import Product from '../models/product.js'
import CartModel from '../models/cart.js'
import { createOrderBodyValidation } from '../utils/validationSchema.js';

var orderInfo;
var key;
export default function route(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setHeader("Access-Control-Allow-Credentials", true);
        next();
      });
      app.use('/user',user );
      app.use('/auth', auth);
      app.use('/auth/refresh-token', refreshToken);
      app.use('/forgot-pw', forgotPassWord);
      app.use('/category', category);
      app.use('/product', product);
      app.use('/cart', cart);
      app.use('/order', order);
      app.use('/chat', messsage);
      app.use('/seller/', seller);
      app.post('/upload_image',[authorization.verifyToken, upload.array('upload_files')], saveFile);
      app.post("/create_payment_url", function (req, res, next) {
        process.env.TZ = "Asia/Ho_Chi_Minh";
      
        let date = new Date();
        let createDate = moment(date).format("YYYYMMDDHHmmss");
      
        let ipAddr =
          req.headers["x-forwarded-for"] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.connection.socket.remoteAddress;
      
        let config = require("config");
      
        let tmnCode = config.get("vnp_TmnCode");
        let secretKey = config.get("vnp_HashSecret");
        let vnpUrl = config.get("vnp_Url");
        let returnUrl = config.get("vnp_ReturnUrl");
        let orderId = req.body.orderId || new Date().getTime();
        key = orderId;
        //thông tin order
        let {orders} = req.body;
        orderInfo = orders
        let amount = 0;
        orders.forEach(element => {
          amount+= element.totalPrice
        });
        //tạm thời chỉ làm thanh toán qua ngân hàng việt nam
        let bankCode = req.body.bankCode || 'VNBANK';
        
        let locale = req.body.language;
        if (!locale) {
          locale = "vn";
        }
        let currCode = "VND";
        let vnp_Params = {};
        vnp_Params["vnp_Version"] = "2.1.0";
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        vnp_Params["vnp_Locale"] = locale;
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = orderId;
        vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
        vnp_Params["vnp_OrderType"] = "other";
        vnp_Params["vnp_Amount"] = amount*100;
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        // order info
        // vnp_Params["owner"] = owner;
        // vnp_Params["address"] = address;
        // vnp_Params["products"] = products;
        // vnp_Params["paymentType"] = paymentType;
        // vnp_Params["vnp_orders"] = JSON.stringify(orders);
        if (bankCode !== null && bankCode !== "") {
          vnp_Params["vnp_BankCode"] = bankCode;
        }
      
        vnp_Params = sortObject(vnp_Params);
        let querystring = require("qs");
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
        vnp_Params["vnp_SecureHash"] = signed;
        vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });
        res.send(JSON.stringify(vnpUrl));
      });
    app.get('/vnpay_return',async function (req, res, next) {
      let vnp_Params = req.query;
      let secureHash = vnp_Params['vnp_SecureHash'];
      let vnp_TxnRef = vnp_Params['vnp_TxnRef'];
      delete vnp_Params['vnp_SecureHash'];
      delete vnp_Params['vnp_SecureHashType'];
  
      vnp_Params = sortObject(vnp_Params);
  
      let config = require('config');
      let tmnCode = config.get('vnp_TmnCode');
      let secretKey = config.get('vnp_HashSecret');
  
      let querystring = require('qs');
      let signData = querystring.stringify(vnp_Params, { encode: false });
      let crypto = require("crypto");     
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
  
      if(secureHash === signed){
        console.log( vnp_Params['vnp_ResponseCode'])
        //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
        let isFailed = false;
        let code = vnp_Params['vnp_ResponseCode']
        if((code == '00' || code == '07') && vnp_TxnRef == key.toString()){
          try {
            console.log('ok')
            let arr = [];
            for(let order of orderInfo) {
              const {error} =  createOrderBodyValidation(order); 
              if(error) {return res.render('payment_success', {isFailed: false});}
              
              let transitHistory = [
                {
                  status:'Đơn hàng đã được đặt thành công',
                  when: new Date()
                },
                {
                  status:'Đơn hàng đã được thanh toán',
                  when: new Date()
                }
              ];
              let statusHistory = [
                  {
                      status: 'created',
                      when: new Date()
                  },
                  {
                      status: 'paid',
                      when : new Date()
                  }
              ];
              order.transitHistory = transitHistory;
              order.statusHistory = statusHistory;
              order.status = 'paid'
              console.log(order);
              const { products } = order;
              
              for(let item of products){
                  let product = await Product.findById(item.productId);
                  if(product){
                      let newSold = product.sold + item.quantity;
                      let promise = Product.findByIdAndUpdate(product._id, { sold: newSold });
                      arr.push(promise);
                  }
              }
              arr.push(Order.create(order));
            }
            let rs = await Promise.all(arr);
            console.log(rs);
            const {owner} = orderInfo[0];
            let cart = await CartModel.findOne({owner: owner});
            if(cart){
              let productIds = [];
              for(let order of orderInfo){
                let {products} = order;
                productIds.push(...products.map(it => it.productId.toString()));
              }
              cart.products = cart._doc.products.filter(item => !productIds.includes(item.productId.toString()))
              await cart.save();
            }
            res.render('payment_success', {isFailed: false})
          } catch (error) {
            console.log(error);
            isFailed = true;
            res.render('payment_success', {isFailed: true})
          }

        }else
          res.render('payment_success', {isFailed: true})
          //res.render('success', {code: vnp_Params['vnp_ResponseCode']})
      } else{
        console.log(2)
         // res.render('success', {code: '97'})
         res.send('that bai')
      }
  });
}
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }