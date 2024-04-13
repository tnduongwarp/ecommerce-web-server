import express from 'express';
import userCtl from '../controller/userCtl.js';
import authorization from '../utils/authorize.js';
import upload from '../utils/saveFile.js';
const router = express.Router();
//test without authorize
router.post('/',[authorization.verifyToken, authorization.isAdmin],userCtl.insertOne);
router.get('/', [authorization.verifyToken, authorization.isAdmin], userCtl.getAllUser);
router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
router.post('/:id',[authorization.verifyToken], userCtl.updateById);
router.post('/:id/upload-avatar', [authorization.verifyToken,upload.single('file')], userCtl.uploadAvatar);
router.get('/shop_info/:id',[authorization.verifyToken], userCtl.getShopInfo);
router.get('/:id', [authorization.verifyToken], userCtl.getDetail)
export default router;