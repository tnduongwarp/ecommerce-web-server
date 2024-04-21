import Product from '../models/product';
import Order from '../models/order';
import Review from '../models/review';
import User from '../models/user'
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
            const toLastMonth = new Date();
            toLastMonth.setMonth(date.getMonth() - 1);
            console.log(toLastMonth)
            const fromLastMonth = startOfMonth(toLastMonth);
            let conditionLastMonth = {
                status:  { $in: ['completed','paid']},
                'products.productId':{ $in: productIds}
            }
            
            if(fromLastMonth && toLastMonth){
                const obj = {
                    $gte : fromLastMonth,
                    $lte : toLastMonth
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
                ret['growth'] = toThisMonth/toLastMonth - 1;
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
    }
}
function startOfMonth(date){
   return new Date(date.getFullYear(), date.getMonth(), 1);
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
    return new Date(year, 0, 1); // Tháng 0 là tháng 1
}

function getLastDayOfYear(year) {
    return new Date(year, 11, 31); // Tháng 11 là tháng 12, ngày 31 là ngày cuối cùng của năm
}