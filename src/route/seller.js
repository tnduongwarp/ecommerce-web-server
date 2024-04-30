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
router.post('/delete-product/:id',[authorization.verifyToken, authorization.isSellerOrAdmin], productCtl.deleteProduct);
router.get('/order/:shopId', [authorization.verifyToken, authorization.isSeller], orderCtl.getOrderForShop);
router.post('/order/status/:id', [authorization.verifyToken, authorization.isSeller], orderCtl.changeOrderStatus);
router.post('/order/transitStatus/:id', [authorization.verifyToken, authorization.isSeller], orderCtl.addOrderTransitHistory);
router.get('/analytic/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getCompareRevenue);
router.post('/analytic-by-products/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getStatiticData);
router.post('/yearly-revenue/:id',[authorization.verifyToken, authorization.isSeller], statiticCtl.getYearlyRevenue);
router.get('/admin/statitic', [authorization.verifyToken, authorization.isAdmin], statiticCtl.getAdminStatiticData);
router.post('/admin/chart', [authorization.verifyToken, authorization.isAdmin], statiticCtl.getAdminVisualData);
router.get('/admin/detail', [authorization.verifyToken, authorization.isAdmin], statiticCtl.getAdminDetailData);
router.post('/admin/send_mail', [authorization.verifyToken, authorization.isAdmin], statiticCtl.sendMail)
router.get('/admin/product', [authorization.verifyToken, authorization.isAdmin], productCtl.getListForAdmin)
export default router;