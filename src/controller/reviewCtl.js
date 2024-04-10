import Review from "../models/review";
import Product from '../models/product'
const sellerCtl = {
    replyReview: async (req, res) => {
        let id = req.params['id'];
        let reply = req.body['reply']
        if(!id || !reply) return res.status(500).json({
            error: true,
            message: 'id and reply is required'
        });
        const review = await Review.findById(id);
        if(!review) return res.status(500).json({
            error: true,
            message: 'review not found'
        });
        review.reply = reply;
        const data = await review.save();
        res.status(200).json({
            error: false,
            data: data
        })
    },

    
}
export default sellerCtl;