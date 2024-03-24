import Product from '../models/product';
import {productBodyValidation, reviewBodyValidation, addToCartBodyValidation} from '../utils/validationSchema'
import Category from '../models/category';
import Review from '../models/review';
import User from '../models/user';
import Cart from '../models/cart';
const productCtl = {
    getList: async (req, res) => {
        try {
            let filter = req.query;
            console.log(filter);
            let skip = Number(filter?.skip) || 0;
            let limit = Number(filter?.limit) || 0;
            let condition = {};
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
            res.status(200).json({
                error: false,
                list_data: listData,
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
            let review =await Review.find({productId: id});
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
            let {id} = req.params;
            const {error} = reviewBodyValidation(req.body);
            if(error)  return res.status(400).json({ error: true, message: error.details[0].message });
            let data = await Review.create(req.body);
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
    }
}
export default productCtl;