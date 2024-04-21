import express from 'express';
import reviewCtl from '../controller/reviewCtl.js';
import authorization from '../utils/authorize.js';
import productCtl from '../controller/product.js';
import orderCtl from '../controller/order.js';
import { statiticCtl } from '../controller/statiticCtl.js';
const router = express.Router();
//test without authorize
// router.post('/',cartCtl);
router.post('/review/:id',[authorization.verifyToken, authorization.isSeller], reviewCtl.replyReview);
router.post('/delete-product/:id',[authorization.verifyToken, authorization.isSeller], productCtl.deleteProduct);
router.get('/order/:shopId', [authorization.verifyToken, authorization.isSeller], orderCtl.getOrderForShop);
router.post('/order/status/:id', [authorization.verifyToken, authorization.isSeller], orderCtl.changeOrderStatus);
router.post('/order/transitStatus/:id', [authorization.verifyToken, authorization.isSeller], orderCtl.addOrderTransitHistory);
router.get('/analytic/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getCompareRevenue);
router.post('/analytic-by-products/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getStatiticData);
router.post('/yearly-revenue/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getYearlyRevenue)
export default router;