import UserToken from '../models/user_token.js';
import jwt from 'jsonwebtoken'
const verifyRefreshToken =  async (refreshToken) => {
    const privateKey = process.env.REFRESH_TOKEN_PRIVATE_KEY;
    try{
        const userToken = await UserToken.findOne({token: refreshToken})
            if (!userToken)
                return Promise.reject({ error: true, message: "Invalid refresh token" });
            const tokenDetails = jwt.verify(refreshToken, privateKey)
                if (!tokenDetails)
                    return Promise.reject({ error: true, message: "Invalid refresh token" });
                return Promise.resolve({
                    tokenDetails,
                    error: false,
                    message: "Valid refresh token",
                });
           
    }  
    catch(err) {
            return Promise.reject({ error: true, message: 'Invalid refresh token' })
        }
}
    

export default verifyRefreshToken;