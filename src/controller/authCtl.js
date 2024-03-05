import bcrypt from 'bcrypt'
import User from '../models/user.js';
import UserToken from '../models/user_token.js';
import generateTokens from "../utils/generateToken.js";
import {
    signUpBodyValidation,
    logInBodyValidation,
} from "../utils/validationSchema.js";
import { refreshTokenBodyValidation } from '../utils/validationSchema.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import sendEmail from '../utils/sendOTPEmail.js';
import generateChangePwToken from '../utils/generateChangePwToken.js';
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const authCtl = {
    login: async (req, res) => {
        try {
            const { error } = logInBodyValidation(req.body);
            if (error)
                return res
                    .status(400)
                    .json({ error: true, message: error.details[0].message });
            var user = await User.findOne({email: req.body.email});
            if (user && (await bcrypt.compare(req.body.password, user.password))) {
                const { accessToken, refreshToken } = await generateTokens(user);

                res.status(200).json({
                    error: false,
                    message: 'Login successfully!',
                    user,
                    accessToken,
                    refreshToken
                });
            }
            else res.status(401).json({
                error: true,
                message: 'Invalid creditials!'
            });
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    },

    signUp: async (req, res) => {
        try {
            const { error } = signUpBodyValidation(req.body);
            if (error)
                return res
                    .status(400)
                    .json({ error: true, message: error.details[0].message });

            const user = await User.findOne({ email: req.body.email });
            
            if (user)
                return res
                    .status(400)
                    .json({ error: true, message: "User with given email already exist" });

            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            let newUser = new User();
            newUser.firstname = req.body.firstname;
            newUser.lastname = req.body.lastname;
            newUser.password = bcrypt.hashSync(req.body.password, salt);
            newUser.email = req.body.email;
            newUser.role = req.body.role;
            await newUser.save()

            res
                .status(201)
                .json({ error: false, message: "Account created sucessfully" });
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    },

    logOut: async (req, res) => {
        try {
            const { error } = refreshTokenBodyValidation(req.body);
            if (error)
                return res
                    .status(400)
                    .json({ error: true, message: error.details[0].message });

            const userToken = await UserToken.findOne({ token: req.body.refreshToken });
            if (!userToken)
                return res
                    .status(200)
                    .json({ error: false, message: "Logged Out Sucessfully" });

            await UserToken.deleteOne({
                userId: userToken.userId
            });
            res.status(200).json({ error: false, message: "Logged Out Sucessfully" });
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: true, message: "Internal Server Error" });
        }
    },

//     handleGoogleLogin: async (req,res) => {
//         const {token} = req.body
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//         });
//         const googleData = ticket.getPayload();
//         console.log(googleData)
//         const user = await db.User.findOne({
//             where: {
//                      email:googleData.email 
//             }
//         });
//         if(user){
//             const { accessToken, refreshToken } = await generateTokens(user);

//                 res.status(200).json({
//                     error: false,
//                     message: 'Login successfully!',
//                     user,
//                     accessToken,
//                     refreshToken
//                 });
//         }else{
//             const salt = await bcrypt.genSalt(Number(process.env.SALT));
//             const newUser = await db.User.create({
//                 username: googleData.name,
//                 password: bcrypt.hashSync(googleData.sub, salt),
//                 email: googleData.email,
//                 registration_date: new Date(),
//                 profile_picture: googleData.picture,
//                 role: 'user'
//             });
//             const { accessToken, refreshToken } = await generateTokens(newUser);
//             res.status(200).json({
//                 error: false,
//                 message: 'Login successfully!',
//                 user: newUser,
//                 accessToken,
//                 refreshToken
//             });
//         }
        
//     },
    sendOTPEmail: async (req, res) => {
        const { recipient_email} = req.body;
        if(!recipient_email) res.status(400).json({error: true, message: "email is require!"});
        const user = await User.findOne({email: recipient_email});
        if(!user) res.status(400).json({error: true, message:"email is incorrect!"})
        else
        sendEmail(req.body)
          .then((response) => res.status(200).json({
            error: false,
            message: response.message
          }))
          .catch((error) => res.status(500).send({
            error: true,
            message: error.message
          }));
    },

    sendChangePwToken: async (req,res) => {
        const {email} = req.body;
        if(!email) res.status(400).json({error: true, message:"email is required!"})
        else {
            generateChangePwToken(email)
            .then((response) => {
                res.status(200).json({
                    error: false,
                    message: 'success',
                    token: response.changePasswordToken
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: true,
                    message: err.message
                })
            })
        }
    }
}
export default authCtl;