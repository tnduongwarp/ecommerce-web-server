import express from 'express';
import messageCtrl from '../controller/messageCtrl.js';
import authorization from '../utils/authorize.js';
const router = express.Router();
//test without authorize
// router.post('/',cartCtl);
router.get('/receivers/:id',[authorization.verifyToken], messageCtrl.getReceiverById);
router.post('/message', [authorization.verifyToken], messageCtrl.getMessage);
router.post('/add_receiver/:id',[authorization.verifyToken], messageCtrl.updateUserMessage)
// router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;