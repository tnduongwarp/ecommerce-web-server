import express from 'express';
import { refreshTokenBodyValidation } from '../utils/validationSchema.js';
import jwt  from 'jsonwebtoken';
import verifyRefreshToken from '../utils/verifyRefreshToken.js';
const router = express.Router();
router.post("/", async (req, res) => {
    try{
        const { error } = refreshTokenBodyValidation(req.body);
        if (error)
            return res
                .status(400)
                .json({ error: true, message: error.details[0].message });
    
        const {tokenDetails} = await verifyRefreshToken(req.body.refreshToken);
        if(tokenDetails){
            const payload = { userId: tokenDetails.userId, role: tokenDetails.role };
            const accessToken = jwt.sign(
                payload,
                process.env.TOKEN_KEY,
                { expiresIn: "14m" }
            );
            res.status(200).json({
                error: false,
                accessToken,
                message: "Access token created successfully",
            });
        }else res.status(405).json({
            err:true,
            message: "Invalid RefreshToken"
        })  
    } catch(err){
         console.log(err)
        res.status(405).json({
            error: true,
            message: err?.message
        })
    }
   
});


export default router;