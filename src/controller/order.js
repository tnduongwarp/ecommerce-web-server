import Order from '../models/order';
import Product from '../models/product';
import User from '../models/user';
import mongoose from 'mongoose';

import { createOrderBodyValidation } from '../utils/validationSchema';
const OrderStatus = {
    Created: 'created',
    InProgress: 'inProgress',
    Completed: 'completed'
}
const orderCtl = {
    createOrder : async (req, res) => {
        try {
            const {error} =  createOrderBodyValidation(req.body);
            if(error)
                return res.status(400).json({ error: true, message: error.details[0].message });
            const order = req.body;
            let transitHistory = [];
            transitHistory.push({
                status:'Đơn hàng đã được đặt thành công',
                when: new Date()
            })
            order.transitHistory = transitHistory;
            if(order.paymentType === 2){
                transitHistory.push({
                    status:'Đơn hàng đã được thanh toán',
                    when: new Date()
                });
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
                order.statusHistory = statusHistory;
            }
            let data = await Order.create(order);
            const { products } = req.body;
            let promises = [];
            for(let item of products){
                let product = await Product.findById(item.productId);
                if(product){
                    let newSold = product.sold + item.quantity;
                    let promise = Product.findByIdAndUpdate(product._id, { sold: newSold });
                    promises.push(promise);
                }
            }
                await Promise.all(promises).catch(err => console.log(err))
                res.status(200).json({
                    error: false,
                    insert: data
                })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    },

    getListOrderForUser: async (req, res) => {
        try {
            const  userId = req.params.userId;
            const q = req.query;
            let condition = {};
            condition['owner'] = userId;
            if(q)
                for(let key of Object.keys(q)){
                    if(key === 'tab'){
                        if(q['tab'] === 'all') continue;
                        condition['status'] = q['tab']
                    }
                    else condition[key] = q[key];
                }
            let data = await Order.find(condition);
            const productIds = [];
            for(let item of data){
                item.products.forEach(p => {
                    if(!productIds.includes(p.productId.toString())) productIds.push(p.productId.toString())
                })
            }
            const products = await Product.find({_id: {$in: productIds}});
            let userIds = products.map(it => it.owner);
            const users = await User.find({_id: {$in: userIds}});
            let orderItems = data.map(it => {
                return JSON.parse(JSON.stringify(it))
            });
            for(let orderItem of orderItems){
                orderItem.products = orderItem.products.map(item => {
                    let product = products.filter(p => {
                        return p._id.toString() === item.productId.toString()
                    })[0];
                    let copyProduct = {...product._doc};
                    copyProduct.image = copyProduct.image.split(',')[0];
                    copyProduct.owner = users.filter(it => (it._id.toString() === copyProduct.owner.toString()))[0];
                    return {
                        product: copyProduct,
                        quantity: item.quantity
                    }
                })
            };
            let ret = {
                orderItems
            };
            let promises = [];
            promises.push(Order.countDocuments({owner: userId}));
            for(let key of Object.keys(OrderStatus)){
                promises.push(Order.countDocuments({owner: userId, status: OrderStatus[key]}));
            }
            await Promise.all(promises).then(
                values => {
                    let sumary = {};
                    sumary['all'] = values[0];
                    sumary['created'] = values[1];
                    sumary['inProgress'] = values[2];
                    sumary['completed'] = values[3];
                    console.log(sumary)
                    ret['sumary'] = sumary;
                }
            )
            console.log(ret)
            res.status(200).json({
                error: false,
                data: ret
            })
        } catch ({error}) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    },
    getOrderDetail: async (req, res) => {
       try {
        const {id} = req.params;
        const order = await Order.findOne({_id: id});
        let orderDetail = {...order._doc};
        let productIds = order.products.map(it => it.productId);
        let products = await Product.find({_id: { $in: productIds}});
        let userIds = products.map(it => it.owner);
        userIds.push(orderDetail.owner)
        let users = await User.find({_id : { $in: userIds}});
        orderDetail.owner = users.find(it => it._id.toString() === orderDetail.owner.toString())
        orderDetail.products = orderDetail.products.map(item => {
            let product = products.find(p => p._id.toString() === item.productId.toString())
            let copy = {...product._doc};
            copy.owner = users.find(it => it._id.toString() === copy.owner.toString())
            return{
                product : copy,
                quantity: item.quantity
            }
        })
        res.status(200).json({
            error: false,
            data: orderDetail
        })
       } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: 'error'
        })
       }
    },
    getOrderForShop: async(req, res) => {
        try {
            const {shopId} = req.params;
            const shop = await User.findById(shopId);
            if(!shop) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const products = await Product.find({owner: shopId});
            const productIds = products.map(it => it._id);
            const {status, skip, limit, search, from, to, client} = req.query;
            let condition = {
                'products.productId':{ $in: productIds}
            }
            if(!skip) skip = 0;
            if(!limit) limit = 0;
            if(status) condition['status'] = status;
            if(from && to){
                const obj = {
                    $gte : new Date(from),
                    $lte : new Date(to)
                }
                condition['created'] = obj
            }
            if(search) {
                condition['_id'] = new mongoose.mongo.ObjectId(search)
            }
            if(client) condition['owner'] = client
            const orders = Order.find(condition).skip(skip).limit(limit);
            const allOrder = Order.find(condition);
            const total =  Order.countDocuments(condition)
            let clientIds, retOrder, totalOrder;
            await Promise.all([orders, allOrder, total]).then(
                data => {
                    clientIds = data[1].map(it => it.owner);
                    retOrder = data[0];
                    totalOrder = data[2]
                }
            ).catch(err => console.log(err))
            const clients = await User.find({_id: {$in: clientIds}})
            res.status(200).json({
                error: false,
                data: retOrder,
                total: totalOrder,
                skip: Number(skip) + retOrder.length,
                clients
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    changeOrderStatus: async (req, res) =>{
        try {
            const {id} = req.params;
            const order = await Order.findById(id);
            if(!order) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const {status} = req.body;
            order.status = status;
            let obj = {
                status: status,
                when: new Date()
            }
            order.statusHistory.push(obj);
            let ret = await order.save();
            res.status(200).json({
                error: false,
                data: ret
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    addOrderTransitHistory: async (req, res) =>{
        try {
            const {id} = req.params;
            const order = await Order.findById(id);
            if(!order) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const {status} = req.body;
            let obj = {
                status: status,
                when: new Date()
            }
            order.transitHistory.push(obj);
            let ret = await order.save();
            res.status(200).json({
                error: false,
                data: ret
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
export default orderCtl;