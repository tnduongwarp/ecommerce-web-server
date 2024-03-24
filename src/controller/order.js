import Order from '../models/order';
import { createOrderBodyValidation } from '../utils/validationSchema';
const orderCtl = {
    createOrder : async (req, res) => {
        try {
            const {error} =  createOrderBodyValidation(req.body);
            if(error)
                return res.status(400).json({ error: true, message: error.details[0].message });
                let data = await Order.create(req.body);
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
    }
}
export default orderCtl;