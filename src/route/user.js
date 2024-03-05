import express from 'express';
import userCtl from '../controller/userCtl.js';
import authorization from '../utils/authorize.js';
const router = express.Router();
//test without authorize
router.post('/',[authorization.verifyToken, authorization.isAdmin],userCtl.insertOne);
router.get('/', [authorization.verifyToken, authorization.isAdmin], userCtl.getAllUser);
router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;