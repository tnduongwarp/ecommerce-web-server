import Order from '../models/order';
import Product from '../models/product';
import { createOrderBodyValidation } from '../utils/validationSchema';
const orderCtl = {
    createOrder : async (req, res) => {
        try {
            const {error} =  createOrderBodyValidation(req.body);
            if(error)
                return res.status(400).json({ error: true, message: error.details[0].message });
                let data = await Order.create(req.body);
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
            const  userId = req.params;
            const {filter} = req.query;
            let condition = {};
            condition['owner'] = userId;
            for(let key of Object.key(filter)){
                condition[key] = filter[key];
            }let data = await Order.find(condition);
            res.status(200).json({
                error: false,
                data: data
            })
        } catch ({error}) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    }
}
export default orderCtl;