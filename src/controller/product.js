import Product from '../models/product';
import {productBodyValidation, reviewBodyValidation, addToCartBodyValidation} from '../utils/validationSchema'
import Category from '../models/category';
import Review from '../models/review';
import User from '../models/user';
import Cart from '../models/cart';
import { UserRefreshClient } from 'google-auth-library';
import Order from '../models/order';
import { AppConst } from '../AppConstant';
import { sendEmailToUser } from '../utils/sendOTPEmail';
const productCtl = {
    getList: async (req, res) => {
        try {
            let filter = req.query;
            let skip = Number(filter?.skip) || 0;
            let limit = Number(filter?.limit) || 0;
            let owner = filter?.owner;
            let condition = { delete: false};
            if(owner) condition['owner'] = owner;
            if(filter?.product){
                if(filter.product !== 'all') {
                    let c = await Category.findOne({url: filter.product});
                    if(c) condition.category = c._id;
                }
            }
            let sort = {};
            if(filter?.sort) {
                filter.sort = JSON.parse(filter.sort)
                if(filter?.sort?.price){
                    sort['price'] = filter.sort.price;
                }
                if(filter.sort?.sortBy) sort[filter.sort.sortBy] = 'desc'
            }
           
            if(filter?.search){
                let search = filter.search
                condition['$or'] = [{ title: new RegExp(search)}, {description: new RegExp(search)}]
            }
            let total = await Product.countDocuments(condition);
            let listData = await Product.find(condition).sort(sort).skip(skip).limit(limit);
            listData = listData.map(data => {
                let image = data.image.split(',');
                return {...data._doc, imageArray: image}
            })
            const ret = listData.map(it => {
                return JSON.parse(JSON.stringify(it));
            })
            let userIds = ret.map(it => it.owner);
            const users = await User.find({_id: {$in: userIds}});
            ret.forEach(it => {
                it.owner = users.find(user => (user._id.toString() === it.owner.toString()))
            })
            res.status(200).json({
                error: false,
                list_data: ret,
                skip: skip,
                
                limit: limit,
                total: total
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    insertOne: async (req, res) => {
       try {
        console.log(req.files)
            const {error} = productBodyValidation(req.body);
            if(error)  return res.status(400).json({ error: true, message: error.details[0].message });
            let data = await Product.create(req.body);
            res.status(200).json({
                error: false,
                insert: data
            })
       } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
       }
    },
    getById: async(req, res) => {

        try {
            let {id} = req.params;
            let product =  await Product.findById(id);
            if(!product) return res.status(400).json({
                error: true,
                message:'Product not found'
            });
            let data = {...product._doc}
            data.image = data.image.split(',');
            let productOwner =await User.findById(product.owner);
            data.owner = productOwner;
            let review =await Review.find({productId: id}).sort({created: 'desc'});
            if(review && review.length){
                data.totalRate = review.length;
                let userIds = review.map(item => (item.owner));
                let u = [];
                userIds.forEach(function(item) {
                    if(u.indexOf(item) < 0) {
                        u.push(item);
                    }
                });
                let promises = u.map(item => {
                    return User.findById(u)
                });
                let userMap = new Map()
                await Promise.all(promises)
                .then(values => {
                    
                    for(let val of values) userMap.set(val._id.toString(), val);
                });
                let reviews = [];
                for(let r of review) {
                    let obj = {...r._doc};
                    obj.owner = userMap.get(r.owner.toString());
                    reviews.push(obj)
                }
                data.reviews = reviews;
                let total = 0;
                for(let item of review){
                    total+=item.rating;
                }
                data.avgRating = total/review.length
            }
            res.status(200).json({
                error: false,
                data: data
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    addReview: async(req, res) => {
        try {
            const {error} = reviewBodyValidation(req.body);
            if(error)  return res.status(400).json({ error: true, message: error.details[0].message });
            const order =await Order.findById(req.body.orderId);
            if(!order) return res.status(400).json({
                error: true,
                message:'Đơn hàng không tồn tại'
            });
            let {productIds} = req.body;
            let promises = []
            for(let id of productIds){
                let review = {...req.body};
                delete review.productIds;
                review.productId = id;
                promises.push( Review.create(review))
            }
            await Promise.all(promises);
            let sh = order.statusHistory.find(it => it.status === AppConst.ORDERSTATUS.completed);
            if(!sh){
                order.statusHistory.push({status: AppConst.ORDERSTATUS.completed, when: new Date()});
                order.status = AppConst.ORDERSTATUS.completed
            }
            let th = order.transitHistory.find(it => it.status === 'Đơn hàng đã hoàn thành');
            if(!th){
                order.transitHistory.push({status: 'Đơn hàng đã hoàn thành', when: new Date()});
            }
            let data = await order.save();
            res.status(200).json({
                error: false,
                insert: data
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    addToCart: async (req, res) => {
        try {
            const {error} = addToCartBodyValidation(req.body);
            if(error)  return res.status(400).json({ error: true, message: error.details[0].message });
            let cart = await Cart.findOne({owner: req.body.owner});
            if(!cart) {
                let data = Cart.create({
                    owner: req.body.owner,
                    products: [{productId: req.body.productId, quantity: req.body.quantity}]
                })
                return res.status(200).json({ error: false, message: 'Thêm sản phẩm vào giỏ hàng thành công', data: data});
            }
            let position = -1;
            for(let i = 0; i < cart.products.length; i++){
                if(cart.products[i].productId == req.body.productId) {
                    position = i;
                    break;
                }
            }
            if(position >= 0) cart.products[position].quantity = cart.products[position].quantity + req.body.quantity;
            else cart.products.push({productId: req.body.productId, quantity: req.body.quantity});
            let data = await cart.save();
            res.status(200).json({
                error: false,
                insert: data
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    getListForSeller : async (req, res) => {
        try {
            let {owner} = req.params;
            let {type} = req.query;
            if(!owner){
                res.status(500).json({
                    error: true,
                    message: 'OwnerId is required'
                })
            }
            let status;
            switch(type){
                case '0': status = 'accepted'; break;
                case '1': status = 'created'; break;
            }
            console.log(status)
            const products = await Product.find({owner: owner, delete: false, status: status});
            res.status(200).json({
                error: false,
                data: products
            })
        }
         catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    updateProduct: async (req, res) => {
        const {id} = req.params;
        const addImage = req.body?.addImage;
        let filenames;
        if(addImage && addImage.length) filenames = addImage
        if(!id) return res.status(500).json({
            error: true,
            message: 'id is required'
        });
        const product = await Product.findById(id);
        if(!product) return res.status(500).json({
            error: true,
            message: 'product not found'
        });
        if(filenames && filenames.length) product.image = product.image +',' + filenames.join(',')
        const { price, amount, title, description, deleteImages } = req.body;
        if(price) product.price = price;
        if(amount) product.amount = amount;
        if(title) product.title = title;
        if(description) product.description = description;
        if(deleteImages){
            let arr = deleteImages;
            let imageArray = product.image.split(',');
            arr.forEach(d => {
                for(let i = 0; i< imageArray.length; i++){
                    if(imageArray[i].includes(d)) {imageArray.splice(i,1); i--}
                }
            });
            product.image = imageArray.join(',')
        }
        
        let data = await product.save();
        res.status(200).json({
            error: false,
            data: data
        })
    },
    deleteProduct: async (req, res) => {
        try {
            const {id} = req.params;
            if(!id) return res.status(500).json({
                error: true,
                message: 'id is required'
            });
            const product = await Product.findById(id);
            if(!product) return res.status(500).json({
                error: true,
                message: 'product not found'
            });
            product.delete = true;
            await product.save()
            res.status(200).json({
                error: false,
                message: 'success'
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    
    getListForAdmin: async (req, res) => {
        try {
            let {type} = req.query;
            let status;
            switch(type){
                case '0': status = 'accepted'; break;
                case '1': status = 'created'; break;
            }
            console.log(status)
            const products = await Product.find({delete: false, status: status});
            let ownerIds = products.map(it => it.owner);
            const users = await User.find({_id: {$in: ownerIds}});
            let ret = [...products];
            ret.forEach(it => {
                it.owner = users.find(u => u._id.toString() === it.owner.toString())
            })
            res.status(200).json({
                error: false,
                data: ret
            })
        }
         catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    acceptProduct: async (req, res) => {
        try {
            const {id} = req.params;
            const product = await Product.findOne({_id: id});
            if(!product){
                res.status(400).json({
                    error: false,
                    message: 'Product not found'
                })
            }
            product.status = 'accepted';
            await product.save();
            let user = await User.findOne({_id: product.owner});
            let mailInfo = {
                recipient_email: user.email,
                name: user.firstname,
                subject: 'SẢN PHẨM MỚI ĐƯỢC PHÊ DUYỆT',
                content: `Sản phẩm ${product.title} của bạn đã được phê duyệt và có thể mua bán trên sàn. Cảm ơn vì đã sử dụng dịch vụ của chúng tôi.`
            }
            console.log(mailInfo)
            sendEmailToUser(mailInfo)
            .then((response) => res.status(200).json({
                error: false,
                message: response.message
              }))
              .catch((error) => res.status(500).send({
                error: true,
                message: error.message
              }));
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }

    }
}
export default productCtl;