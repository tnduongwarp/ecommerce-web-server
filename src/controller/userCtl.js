import User from '../models/user.js';
import bcrypt from 'bcrypt'
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
            const {id, newPassword} = req.body;
            const user = await User.findOne({_id: id});
            if(!user) res.status(400).json({error: true, message: 'User Not Found!'});
            else{
                let user =await User.findOne({_id: id});
                user.password = bcrypt.hashSync(newPassword,salt);
                await user.save();
                res.status(200).json({
                    message: 'success',
                    data:user
                })
            }
            
        }catch(err){
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
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
            await User.deleteOne({ id: id});
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
    ,
    updateById: async (req, res) => {
        try {
            let {id} = req.params;
            let user = await User.findOne({_id: id});
            if(!user) res.status(400).json({
                error: true,
                message: 'User not found'
            });
            const params = req.body;
            for(let key of Object.keys(params)){
                user[key] = params[key];
            }
            let updatedUser = await user.save();
            res.status(200).json({
                error: false,
                data: updatedUser
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }
    }
    
}
export default userCtl;