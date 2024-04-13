import express from 'express';
import reviewCtl from '../controller/reviewCtl.js';
import authorization from '../utils/authorize.js';
import productCtl from '../controller/product.js';
import orderCtl from '../controller/order.js';
const router = express.Router();
//test without authorize
// router.post('/',cartCtl);
router.post('/review/:id',[authorization.verifyToken, authorization.isSeller], reviewCtl.replyReview);
router.post('/delete-product/:id',[authorization.verifyToken, authorization.isSeller], productCtl.deleteProduct);
router.get('/order/:shopId', [authorization.verifyToken, authorization.isSeller], orderCtl.getOrderForShop)
export default router;