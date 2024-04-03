import express from 'express';
import productCtl from '../controller/product.js';
import authorization from '../utils/authorize.js';

const router = express.Router();
//test without authorize
router.post('/',productCtl.insertOne);
router.get('/', productCtl.getList);
router.get('/:id',[authorization.verifyToken], productCtl.getById);
router.post('/add-review',[authorization.verifyToken], productCtl.addReview);
router.post('/add-to-cart',[authorization.verifyToken], productCtl.addToCart)
// router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;