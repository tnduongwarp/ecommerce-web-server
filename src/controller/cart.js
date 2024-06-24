import Cart from "../models/cart";
import User from '../models/user';
import Product from '../models/product';
const cartCtrl = {
    getProductsInCartByUserId: async (req, res) => {
        try {
            let userId = req.params.id;
            let user = await User.find({_id: userId});
            if(!user || user.isSeller) return res.status(400).json({
                error: true,
                message: 'Cart Not Exist!'
            })
            const cart = await Cart.findOne({owner: userId});
            if(!cart) return res.status(400).json({
                error: true,
                message: 'Cart Not Exist!'
            });
            const productIds = cart._doc.products.map(it => it.productId);
            const products = await Product.find({_id: {$in: productIds}});
            let userIds = products.map(it => it.owner);
            const users = await User.find({_id: {$in: userIds}});
            let data = {...cart._doc};
            data.owner = user;
            data.products = data.products.map(item => {
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
            res.status(200).json({
                error: false,
                data: data
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    },

    removeItem: async (req, res) => {
        try {
                let {userId, productIds} = req.body;
                const cart = await Cart.findOne({owner: userId});
                if(cart){
                    cart.products = cart._doc.products.filter(item => (!productIds.includes(item.productId.toString())));
                    let data = await cart.save();
                    res.status(200).json({
                    error: false,
                    data: data
                    })
                }else{
                    res.status(200).json({
                        error: false,
                        message: 'Cart does not have this item'
                    })
                }
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    },
}
export default cartCtrl;