import express from 'express';
import productCtl from '../controller/product.js';
import authorization from '../utils/authorize.js';
import upload from '../utils/saveFile.js';

const router = express.Router();
//test without authorize
router.post('/', [authorization.verifyToken, authorization.isSeller ,upload.array('files',10)], productCtl.insertOne);
router.get('/', [authorization.verifyToken], productCtl.getList);
router.get('/:id',[authorization.verifyToken], productCtl.getById);
router.post('/add-review',[authorization.verifyToken, authorization.isUser], productCtl.addReview);
router.post('/add-to-cart',[authorization.verifyToken, authorization.isUser], productCtl.addToCart);
router.get('/getListForSeller/:owner', [authorization.verifyToken, authorization.isSeller], productCtl.getListForSeller)
router.post('/update/:id',[authorization.verifyToken, authorization.isSeller ,upload.array('files',10)], productCtl.updateProduct )
export default router;