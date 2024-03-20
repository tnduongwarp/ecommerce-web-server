import jwt from "jsonwebtoken";
import UserToken from '../models/user_token.js';
import User from '../models/user.js';
const generateChangePwToken = async (email) => {
    try {
        const payload = { email: email, date: new Date() };
        const changePasswordToken = jwt.sign(
            payload,
            process.env.TOKEN_KEY,
            { expiresIn: "5m" }
        );
        const user = await User.findOne({email: email});
        const userToken = await UserToken.findOne({userId: user._id });
        if (userToken) {
            await UserToken.deleteOne({
                    userId: user._id
            });
        }
        let newUserToken = new UserToken();
        newUserToken.userId = user._id;
        newUserToken.token = refreshToken;
        newUserToken.created = new Date();
        await UserToken.save();
        return Promise.resolve({ changePasswordToken });
    } catch (err) {
        return Promise.reject({message: 'Internal Server Error'});
    }
};

export default generateChangePwToken;