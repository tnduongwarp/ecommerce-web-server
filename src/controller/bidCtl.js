import Bid from '../models/seller_biz';
import Product from '../models/product';
import User from '../models/user'
import { createBidBodyValidation } from '../utils/validationSchema';
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
            for(let key of Object.keys(body)){
                bid[key] = body[key];
            }
            let updateBid = await bid.save();
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
            
        }
    }
}
export default bidCtl;