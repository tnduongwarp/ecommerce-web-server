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

export default function route(app){
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
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
      app.post('/create_payment_url', function (req, res, next) {
        var ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    
        var config = require('config');
        var dateFormat = require('dateformat');
    
        
        var tmnCode = config.get('vnp_TmnCode');
        var secretKey = config.get('vnp_HashSecret');
        var vnpUrl = config.get('vnp_Url');
        var returnUrl = config.get('vnp_ReturnUrl');
    
        var date = new Date();
    
        var createDate = dateFormat(date, 'yyyymmddHHmmss');
        var orderId = dateFormat(date, 'HHmmss');
        var amount = req.body.amount;
        var bankCode = 'VNBANK';
        
        var orderInfo = req.body.orderDescription;
        var orderType = req.body.orderType;
        var locale = req.body.language;
        if(locale === null || locale === ''){
            locale = 'vn';
        }
        var currCode = 'VND';
        var vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        // vnp_Params['vnp_Merchant'] = ''
        vnp_Params['vnp_Locale'] = locale;
        vnp_Params['vnp_CurrCode'] = currCode;
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = orderType;
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if(bankCode !== null && bankCode !== ''){
            vnp_Params['vnp_BankCode'] = bankCode;
        }
    
        vnp_Params = sortObject(vnp_Params);
    
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");     
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    
        res.redirect(vnpUrl)
    });
    app.get('/vnpay_return', function (req, res, next) {
      let vnp_Params = req.query;
  
      let secureHash = vnp_Params['vnp_SecureHash'];
  
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
          //Kiem tra xem du lieu trong db co hop le hay khong va thong bao ket qua
  
          res.render('success', {code: vnp_Params['vnp_ResponseCode']})
      } else{
          res.render('success', {code: '97'})
      }
  });
}