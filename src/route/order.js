import express from 'express';
import orderCtl from '../controller/order.js';
import authorization from '../utils/authorize.js';

const router = express.Router();
//test without authorize
router.post('/',[authorization.verifyToken, authorization.isUser], orderCtl.createOrder);
router.get('/:userId/list',[authorization.verifyToken, authorization.isUser], orderCtl.getListOrderForUser)
router.get('/:id',[authorization.verifyToken, authorization.isSellerOrUser], orderCtl.getOrderDetail);

export default router;