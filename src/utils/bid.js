import Bid from '../models/seller_biz';
import Product from '../models/product';
import User from '../models/user';
export const  bidService = {
     getAllBidCreated: async (from, to) => {
        let fromTime = new Date(from);
        let toTime = new Date(to);
        fromTime.setDate(fromTime.getDate() - 7);
        toTime.setDate(toTime.getDate() - 7)
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
        return ret;
    },
    refreshBid: async () => {
        const date1 = new Date();
        const date2 = new Date();
        let day1 = date1.getDay();
        date1.setDate(date1.getDate()+ countPlusDate(day1));
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date1.setMilliseconds(0);        // to date
        date2.setDate(date1.getDate()+ 7);
        date2.setHours(23);
        date2.setMinutes(59);
        date2.setSeconds(59);
        // tru di 7 ngay de ve tuan hien tai
        date1.setDate(fromTime.getDate() - 7);
        date2.setDate(toTime.getDate() - 7)
        const bids = await Bid.find({status: 'accepted', isActive: true});
        let promises = [];
        for(let bid of bids){
            bid.isActive = false;
            promises.push(bid.save())
        };
        await Promise.all(promises);
        promises = [];
        const newBids = await Bid.find({status: 'accepted',created: {$gte: date1, $lte: date2}});
        for(let bid of newBids){
            bid.isActive = true;
            promises.push(bid.save())
        }
        await Promise.all(promises);
    }
}
function countPlusDate(day){
    if(!day) return 1;
    else return 8-day;
  }