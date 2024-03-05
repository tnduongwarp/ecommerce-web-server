import User from '../models/user.js';
import UserToken from '../models/user_token.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const privateKey = process.env.TOKEN_KEY;
const salt = bcrypt.genSaltSync(10);
let userCtl = {
    insertOne: async  (req, res) => {
        const data = req.body;
        if(data?.password && data?.role && data.email){
            try{
                let newUser = new User();
                newUser.firstname = req.body.firstname;
                newUser.lastname = req.body.lastname;
                newUser.password = bcrypt.hashSync(req.body.password, salt);
                newUser.email = req.body.email;
                newUser.role = req.body.role;
                await newUser.save()
                
                res.status(200).json({
                        message: 'success',
                        data:user
                })
                
            }
            catch(err) {console.log(err)} 
        }else{
            res.status(400).json({
                message: 'invalid body'
            })
        }
    } ,
    changePassword : async (req, res) => {
        try{
            const {token, newPassword} = req.body;
            const userToken = await UserToken.findOne({token: token});
            if(!userToken) res.status(400).json({error: true, message: 'forbiden'});
            else{
                const decodeToken = jwt.verify(token, privateKey);
                if(decodeToken){
                    // let user = await db.User.update(
                    //     {password: bcrypt.hashSync(newPassword,salt)},
                    //     { where: {id: userToken.userId}}
                    // )
                    let user =await User.findOne({_id: userToken.userId});
                    user.password = bcrypt.hashSync(newPassword,salt);
                    await user.save();
                    res.status(200).json({
                        message: 'success',
                        data:user
                })
                }
            }
            
        }catch(err){
            res.status(402).json({
                error: true,
                message: 'token is expired'
            })
        }
        
    },
    getAllUser : async (req, res) => {
        try{
            let users = await User.find({});
            if(users){
                res.status(200).json({
                    error: false,
                    data: users
                })
            }
            
        }catch(err){
            res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }
    },
    deleteUser : async(req,res) => {
        try {
            const id = req.params.id;
            await User.remove({ id: id});
            res.status(200).json({
                error: false,
                message: 'Delete successfully'
            })
        } catch (error) {
            res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }
    }
    
    
}
export default userCtl;