import express from 'express';
import cartCtl from '../controller/cart.js';
import authorization from '../utils/authorize.js';
const router = express.Router();
//test without authorize
// router.post('/',cartCtl);
router.get('/:id',[authorization.verifyToken], cartCtl.getProductsInCartByUserId);
router.post('/remove-item', [authorization.verifyToken], cartCtl.removeItem)
// router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;