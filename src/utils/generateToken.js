import jwt from "jsonwebtoken";
import UserToken from '../models/user_token.js'
const generateTokens = async (user) => {
    try {
        const payload = { userId: user._id, role: user.role };
        const accessToken = jwt.sign(
            payload,
            process.env.TOKEN_KEY,
            { expiresIn: "90m" }
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            { expiresIn: "30d" }
        );

        const userToken = await UserToken.deleteOne({ userId: user._id });
        let newUserToken = new UserToken();
        newUserToken.userId = user._id;
        newUserToken.token = refreshToken;
        newUserToken.created = new Date();
        await newUserToken.save();
        return Promise.resolve({ accessToken, refreshToken });
    } catch (err) {
        return Promise.reject(err);
    }
};

export default generateTokens;