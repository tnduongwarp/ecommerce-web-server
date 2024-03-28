import express from 'express';
import orderCtl from '../controller/order.js';
import authorization from '../utils/authorize.js';

const router = express.Router();
//test without authorize
router.post('/',[authorization.verifyToken], orderCtl.createOrder);
router.get('/:userId',[authorization.verifyToken], orderCtl.getListOrderForUser)
// router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;