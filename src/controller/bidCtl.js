import Bid from '../models/seller_biz';
import Product from '../models/product';
import User from '../models/user'
import { createBidBodyValidation } from '../utils/validationSchema';
import {sendEmailToUser} from '../utils/sendOTPEmail'
const bidCtl = {
    addBiz: async (req, res) => {
        try {
            const body = req.body;
            const {error} = createBidBodyValidation(body);
            if(error)  return res.status(400).json({ error: true, message: error.details[0].message });
            let data = await Bid.create(body);
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
    updateBid: async (req, res) => {
        try {
            const {id} = req.params;
            let bid = await Bid.findById(id);
            if(!bid) return res.status(400).json({error: true, message: `Bid ${id} not found`});
            const body = req.body;
            let shouldSendEmail = false;
            for(let key of Object.keys(body)){
                bid[key] = body[key];
                if(key == 'status' && body[key] == 'accepted'){
                    shouldSendEmail = true;
                }
            }
            let updateBid = await bid.save();
            if(shouldSendEmail){
                let seller = await User.findOne({_id: bid.owner});
                sendEmailToUser({
                    recipient_email:seller.email,
                    name: seller.firstname,
                    subject: 'Đấu giá thành công',
                    content: `Đơn đấu giá của bạn đã được chấp nhận, sản phẩm của bạn sẽ được hiển thị ở trang chủ của sàn chúng tôi trong tuần tới, vui lòng thanh toán ${bid.price} đ để không bị gián đoạn dịch vụ`
                }).then().catch(err => console.log(err))
            }
            res.status(200).json({
                error: false,
                data: updateBid
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    getAllBids: async (req, res) => {
        try {
            const {from, to} = req.body;
            let fromTime = new Date(from);
            let toTime = new Date(to);
            fromTime.setDate(fromTime.getDate() - 7);
            toTime.setDate(toTime.getDate() - 7);
            console.log(fromTime, toTime)
            const bids = await Bid.find({created: {$gte: fromTime, $lte: toTime}}).sort({price: 'desc'});
            let productIds = [];
            let userIds = [];
            bids.forEach(bid => {
                productIds = [...productIds,...bid.products.map(it => it.productId)];
                userIds.push(bid.owner)
            });
            const [products, users] = await Promise.all([Product.find({_id: {$in: productIds}}), User.find({_id: {$in: userIds}})]);
            let ret = JSON.parse(JSON.stringify(bids));
            ret.forEach(bid => {
                let productsOfBid = JSON.parse(JSON.stringify(bid.products));
                productsOfBid.forEach(p => {
                    let tmp = products.find(it => (it._id.toString() === p.productId.toString()));
                    p['product'] = tmp;
                    console.log(p)
                });
                bid.products = productsOfBid
                bid.owner = users.find(u => u._id.toString() === bid.owner.toString());
            })
            res.status(200).json({
                error: false,
                data: ret
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    getBidHistory: async(req, res) => {
        try {
            const {id} = req.params;
            const bids = await Bid.find({created: {$lte: new Date()}, owner: id});
            let productIds = [];
            bids.forEach(bid => {
                productIds = [...productIds,...bid.products.map(it => it.productId)];
            });
            const products = await Product.find({_id: {$in: productIds}});
            let ret = JSON.parse(JSON.stringify(bids));
            ret.forEach(bid => {
                let productsOfBid = JSON.parse(JSON.stringify(bid.products));
                productsOfBid.forEach(p => {
                    let tmp = products.find(it => (it._id.toString() === p.productId.toString()));
                    p['product'] = tmp;
                    console.log(p)
                });
                bid.products = productsOfBid
            })
            res.status(200).json({
                error: false,
                data: ret
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    getAcceptedBid: async(req, res) => {
        try {
            const bids = await Bid.find({status: 'accepted', isActive: true});
            res.status(200).json({
                error: false,
                data: bids
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    }
}
export default bidCtl;