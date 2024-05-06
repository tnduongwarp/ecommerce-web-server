import Product from '../models/product';
import Order from '../models/order';
import Review from '../models/review';
import User from '../models/user';
import { sendEmailToUser } from '../utils/sendOTPEmail';
export const statiticCtl = {
    getStatiticData: async (req, res)=> {
        try {
            const { id } = req.params;
           
            const shop = await User.findById(id);
            if(!shop) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const products = await Product.find({owner: id, delete: false});
            const productIds = products.map(it => it._id.toString());
            const { reqProductIds} = req.body;
            const conditionProductIds = reqProductIds.filter(it => productIds.includes(it));
            const { from, to} = req.query;
            let condition = {
                status:  { $in: ['completed','paid']},
                'products.productId':{ $in: conditionProductIds}
            }
            
            if(from && to){
                const obj = {
                    $gte : new Date(from),
                    $lte : new Date(to)
                }
                condition['created'] = obj
            }
            const allOrder =await Order.find(condition);
            const data = analysData(allOrder);
            res.status(200).json({
                error: false,
                data: data
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    
    getCompareRevenue: async (req, res) =>{
        try {
            const {id} = req.params;
            const shop = await User.findById(id);
            if(!shop) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const products = await Product.find({owner: id, delete: false});
            const productIds = products.map(it => it._id.toString());
            const fromThisMonth = startOfMonth(new Date());
            const toThisMonth = new Date();
            let conditionThisMonth = {
                status:  { $in: ['completed','paid']},
                'products.productId':{ $in: productIds}
            }
            
            if(fromThisMonth && toThisMonth){
                const obj = {
                    $gte : fromThisMonth,
                    $lte : toThisMonth
                }
                conditionThisMonth['created'] = obj
            }
            console.log(conditionThisMonth)
            const orderDataThisMonth = Order.find(conditionThisMonth);
            let date = new Date();
            date.setMonth(date.getMonth() - 1);
            const toLastMonth = startOfMonth(new Date());
            const fromLastMonth = startOfMonth(date);
            let conditionLastMonth = {
                status:  { $in: ['completed','paid']},
                'products.productId':{ $in: productIds}
            }
            
            if(fromLastMonth && toLastMonth){
                const obj = {
                    $gte : fromLastMonth,
                    $lt : toLastMonth
                }
                conditionLastMonth['created'] = obj
            }
            const orderDataLastMonth = Order.find(conditionLastMonth);
            let ret = {};
            let dataThisMonth, dataLastMonth;
            await Promise.all([orderDataLastMonth, orderDataThisMonth]).then(
                values => {
                    dataThisMonth = values[1];
                    dataLastMonth = values[0];
                }
            ).catch(err => {
                console.log(err)
            });
            dataThisMonth = await analystData1(dataThisMonth);
            ret = {...dataThisMonth}
            let totalMnLastMonth = 0;
            for(let order of dataLastMonth){
                totalMnLastMonth+= order.totalPrice;
            };
            let totalMnThisMonth = dataThisMonth.totalMoney;
            if(totalMnLastMonth && totalMnThisMonth){
                ret['growth'] = totalMnThisMonth/totalMnLastMonth - 1;
            }else if(totalMnLastMonth){
                ret['growth'] = totalMnLastMonth*(-100)
            }else if(totalMnThisMonth){
                ret['growth'] = totalMnThisMonth*(100)
            }else{
                ret['growth'] = 0
            }
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
    getYearlyRevenue: async (req, res) => {
        try {
            const {id} = req.params;
            const { year} = req.body;
            const shop = await User.findById(id);
            if(!shop) return res.status(400).json({
                error: true,
                message:' shop not found'
            });
            const products = await Product.find({owner: id, delete: false});
            const productIds = products.map(it => it._id.toString());
            const { from, to} = req.query;
            let condition = {
                status:  { $in: ['completed','paid']},
                'products.productId':{ $in: productIds}
            }
            const obj = {
                $gte : getFirstDayOfYear(year),
                $lte :getLastDayOfYear(year)
            }
            condition['created'] = obj
            const allOrder =await Order.find(condition);
            let data = [0,0,0,0,0,0,0,0,0,0,0,0];
            for(let order of allOrder){
                let date = new Date(order.created);
                let month = date.getMonth();
                data[month] += order.totalPrice
            }
            res.status(200).json({
                error: false,
                data: data
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    getAdminStatiticData: async (req, res) => {
        try {
            const ret = {};
            const promises = [];
            let p1 = User.countDocuments({role: 'user'});
            promises.push(p1);
            let p2 = User.countDocuments({role: 'user', created: { $gte: startOfMonth(new Date())}});
            promises.push(p2);
            let p3 = User.countDocuments({role: 'seller'});
            promises.push(p3);
            let p4 = User.countDocuments({role: 'seller', created: { $gte: startOfMonth(new Date())}});
            promises.push(p4); 
            let p5 = Order.find({});
            promises.push(p5);
            let p6 = Order.find({created: { $gte: startOfMonth(new Date())}});
            promises.push(p6);
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            let p7 = Order.find({created: {$lte: startOfMonth(new Date()), $gte: startOfMonth(lastMonth)}});
            promises.push(p7);
            Promise.all(promises).then(
                datas => {
                    ret['totalUser'] = datas[0];
                    ret['userThisMonth'] = datas[1];
                    ret['totalSeller'] = datas[2];
                    ret['sellerThisMonth'] = datas[3];
                    ret['totalOrder'] = datas[4].length;
                    ret['orderThisMonth'] = datas[5].length;
                    let totalRevenue = 0;
                    let thisMonthRevenue = 0;
                    let lastMonthRevenue = 0;
                    for(let order of datas[4]){
                        totalRevenue += order.totalPrice;
                    }
                    for(let order of datas[5]){
                        thisMonthRevenue += order.totalPrice;
                    }
                    for(let order of datas[6]){
                        lastMonthRevenue += order.totalPrice;
                    }
                    ret['totalRevenue'] = totalRevenue;
                    ret['thisMonthRevenue'] = thisMonthRevenue;
                    if(thisMonthRevenue && lastMonthRevenue){
                        ret['growth'] = thisMonthRevenue/lastMonthRevenue - 1;
                    }else if(lastMonthRevenue){
                        ret['growth'] = lastMonthRevenue*(-100)
                    }else if(thisMonthRevenue){
                        ret['growth'] = thisMonthRevenue*(100)
                    }else{
                        ret['growth'] = 0
                    }
                    res.status(200).json({
                        error: false,
                        data: ret
                    })
                }
            ).catch(err => {
                console.log(err);
                res.status(500).json({
                    error: true,
                    message: 'Internal Server Error'
                })
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },
    getAdminVisualData: async (req, res) => {
        try {
            const {year = new Date().getFullYear()} = req.body;
            const condition = {}
            const obj = {
                $gte : getFirstDayOfYear(year),
                $lte :getLastDayOfYear(year)
            }
            condition['created'] = obj
            const allOrder =await Order.find(condition);
            let data = [0,0,0,0,0,0,0,0,0,0,0,0];
            for(let order of allOrder){
                let date = new Date(order.created);
                let month = date.getMonth();
                data[month] += order.totalPrice
            };
            res.status(200).json({
                error: false,
                data: data
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    getAdminDetailData: async (req, res) => {
        try {
            const {month} = req.query;
            let range;
            if(month == 'thisMonth'){
                range = {
                    $gte: startOfMonth(new Date())
                }
            }else if(month == 'lastMonth'){
                let date = new Date();
                date.setMonth(date.getMonth() -1);
                range = {
                    $gte: startOfMonth(date),
                    $lt: startOfMonth(new Date())
                }
            }
            const sellers = await User.find({role: 'seller', isDelete: false});
            let ownerIds = sellers.map(it => it._id);
            const products = await Product.find({owner: {$in: ownerIds}});
            
            let productIds = products.map(it => it._id);
            const orders = await Order.find({'products.productId': {$in: productIds}, created: range});
            let ret = [];
            for(let seller of sellers){
                const obj = {
                    _id: seller._id,
                    name: seller?.shopName,
                    picture: seller.picture,
                    email: seller.email
                };
                let productIds = products.filter(it => (it.owner.toString() === seller._id.toString())).map(it => it._id.toString());
                let order = orders.filter(it => {
                    let pId = it.products.map(p => p.productId.toString());
                    for(let id of pId){
                        if(productIds.includes(id))
                        return true;
                    }
                    return false;
                });
                let sum = 0;
                order.forEach(o => {
                    sum += o.totalPrice;
                });
                obj['revenue'] = sum;
                ret.push(obj);
            }
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
    sendMail: async (req, res) => {
        try {
            const { recipient_email, name, subject, content} = req.body;
            if(!recipient_email) res.status(400).json({error: true, message: "email is require!"});
            const user = await User.findOne({email: recipient_email});
            if(!user) res.status(400).json({error: true, message:"email is incorrect!"});
            else{
                sendEmailToUser({recipient_email, name, subject, content})
                .then((response) => res.status(200).json({
                  error: false,
                  message: response.message
                }))
                .catch((error) => res.status(500).send({
                  error: true,
                  message: error.message
                }));
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    }
}
function startOfMonth(date){
   return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0, 0);
}

async function analystData1(orders){
    let ret = {}
    const orderIds = orders.map(it => it._id);
    let reviews = await Review.find({orderId: {$in: orderIds}});
    let totalRate = 0;
    for(let i = 0; i < reviews.length; i ++){
        totalRate += reviews[i].rating;
    };
    if(reviews.length){
        ret['avgRating'] = totalRate/reviews.length;
        ret['rateCount'] = reviews.length;
    }else{
        ret['avgRating'] = 0;
        ret['rateCount'] = 0;
    }
    let totalMoney = 0;
    for(let order of orders){
        totalMoney += order.totalPrice;
    }
    ret['totalMoney'] = totalMoney;
    ret['orderCount'] = orders.length;
    return ret;
}
 function analysData (listOrder){
    const summaryProductCount = {};
    let totalPrice = 0;
    let totalReview = 0;
    let totalStar = 0;
    for(let item of listOrder){
        totalPrice += item?.totalPrice ?? 0;
        for(let product of item?.products){
            if(summaryProductCount[product.productId.toString()]){
                summaryProductCount[product.productId.toString()] += product?.quantity ?? 0;
            }else{
                summaryProductCount[product.productId.toString()] = product?.quantity;
            }
        }
    }
    return {
        revenue: totalPrice,
        orderNumber: listOrder.length,
        sumary: summaryProductCount
    }
}

function getFirstDayOfYear(year) {
    return new Date(year, 0, 1, 0, 0, 0, 0, 0); // Tháng 0 là tháng 1
}

function getLastDayOfYear(year) {
    return new Date(year, 11, 31, 0, 0, 0, 0, 0); // Tháng 11 là tháng 12, ngày 31 là ngày cuối cùng của năm
}