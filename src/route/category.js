import express from 'express';
import categoryCtl from '../controller/category.js';
import authorization from '../utils/authorize.js';
const router = express.Router();
router.post('/',[authorization.verifyToken],categoryCtl.insert);
router.get('/',categoryCtl.getAll);
// router.post('/delete/:id',[authorization.verifyToken, authorization.isAdmin], userCtl.deleteUser )
export default router;