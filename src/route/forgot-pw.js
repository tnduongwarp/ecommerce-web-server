import express from 'express';
import authCtl from '../controller/authCtl.js'
import userCtl from '../controller/userCtl.js';
const router = express.Router();
router.post('/send_recovery_email',authCtl.sendOTPEmail);
router.post('/change-pw',userCtl.changePassword )
export default router;
