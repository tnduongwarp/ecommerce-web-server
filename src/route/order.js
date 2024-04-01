import express from 'express';
import orderCtl from '../controller/order.js';
import authorization from '../utils/authorize.js';

const router = express.Router();
//test without authorize
router.post('/',[authorization.verifyToken], orderCtl.createOrder);
router.get('/:userId/list',[authorization.verifyToken], orderCtl.getListOrderForUser)
router.get('/:id',[authorization.verifyToken], orderCtl.getOrderDetail)
export default router;