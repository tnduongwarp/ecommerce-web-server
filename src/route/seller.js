import express from 'express';
import reviewCtl from '../controller/reviewCtl.js';
import authorization from '../utils/authorize.js';
import productCtl from '../controller/product.js';
const router = express.Router();
//test without authorize
// router.post('/',cartCtl);
router.post('/review/:id',[authorization.verifyToken], reviewCtl.replyReview);
router.post('/delete-product/:id',[authorization.verifyToken], productCtl.deleteProduct);
export default router;