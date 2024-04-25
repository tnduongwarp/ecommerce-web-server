import User from '../models/user.js';
import Product from '../models/product.js';
import Review from '../models/review.js'
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
    },
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
    },
    updateById: async (req, res) => {
        try {
            let {id} = req.params;
            let user = await User.findOne({_id: id});
            if(!user) res.status(400).json({
                error: true,
                message: 'User not found'
            });
            const params = req.body;
            console.log(params)
            for(let key of Object.keys(params)){
                user[key] = params[key];
                console.log(user[key])
            };
            console.log(user)
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
    },
    uploadAvatar: async (req, res) => {
        try {
            const {id} = req.params;
            const {fileName} = req.body;
            if(!fileName) return res.statsu(400).json({
                error: true,
                message: 'Error'
            });
            const picture = fileName;
            let user = await User.findOne({_id: id});
            if(!user) res.status(400).json({
                error: true,
                message: 'User not found'
            });
            user.picture = picture;
            await user.save()
            res.status(200).json({
                error: false,
                data: user
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal server error'
            })
        }
    },

    getShopInfo: async (req, res) =>{
       try {
        const {id} = req.params;
        console.log(id)
        const user = await User.findOne({_id: id});
        const products = await Product.find({owner: id});
        const ret = {};
        ret.shop = user;
        ret.totalProduct = products.length;
        let productIds = products.map(p => p._id);
        const reviews = await Review.find({productId: {$in: productIds}});
        let totalRate = 0;
        reviews.forEach(rv => {
            totalRate += rv.rating;
        })
        ret.totalReview = reviews.length;
        ret.avgRate = totalRate/reviews.length;
        res.status(200).json({
            error: false,
            data: ret
        })
       } catch (error) {
        console.log(error);
        res.status(500).json({
            error: true,
            message: 'Internal Server Error'
        })
       }
    },

    getDetail: async (req, res) => {
        try {
            const {id} = req.params;
            const user = await User.findById(id);
            if(!user){
                res.status(400).json({
                    error: true,
                    message:'User Not Found'
                })
            }
            res.status(200).json({
                error: false,
                data: user
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    getListUser: async (req, res) => {
        try {
            console.log(req.query)
            const { skip = 0, limit = 10, role} = req.query;
            console.log(skip, limit, role)
            let total, listData;
            if(role){
                total = User.countDocuments({role: role, $or: [{isDelete: false}, {isDelete: {$exists: false}}]});
                listData = User.find({role: role, $or: [{isDelete: false}, {isDelete: {$exists: false}}]}).skip(skip).limit(limit);
            }else{
                total = User.countDocuments({ $or: [{isDelete: false}, {isDelete: {$exists: false}}]});
                listData = User.find({ $or: [{isDelete: false}, {isDelete: {$exists: false}}]}).skip(skip).limit(limit);
            }
            await Promise.all([total, listData]).then(
                data => {
                    res.status(200).json({
                        error: false,
                        list_data: data[1],
                        skip: skip,
                        limit: limit,
                        total: data[0]
                    })
                }
            )
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    }
    
}
export default userCtl;