import Message from '../models/message';
import UserMessage from '../models/userMessage';
import User from '../models/user'
const messageCtrl = {
    getReceiverById: async (req, res) => {
        try {
            let ret = [];
            const {id} = req.params;
            const receiverIds = await UserMessage.findOne({owner: id});
            if(!receiverIds) return res.status(200).json({
                error: false,
                data: []
            })
            const users = await User.find({_id: { $in: receiverIds.receivers || []}});
            let promises = [];
            for(let user of users){
                const m = {};
                m.user = user;
                const firstMsg = Message.find(
                    {$or:[{owner: id, receiver: user._id},{owner: user._id, receiver: id}]}
                ).sort({created: -1}).limit(1);
                promises.push(firstMsg);
                ret.push(m)
            }
            await Promise.all(promises).then(data => {
                for(let i = 0; i< ret.length; i++){
                    ret[i].firstMsg = data[i];
                }
            }) 
            res.status(200).json({
                error: false,
                data: ret
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }
    },

    getMessage: async (req, res) => {
       try {
        const {owner, receiver} = req.body;
        const data = await Message.find({owner: owner, receiver: receiver}).sort({created: 1});
        res.status(200).json({
            error: false,
            data: data
        })
       } catch (error) {
        console.log(error)
        res.status(500).json({
            error: true,
            message: 'Internal Server Error'
        })
       }

    },
    updateUserMessage: async (req, res) => {
       try {
        const {id} = req.params;
        const {receiver} = req.body;
        const  q1= UserMessage.findOne({owner: id});
        const  q2= UserMessage.findOne({owner: receiver});
        let values = await Promise.all([q1,q2]);
        const myUserMessage = values[0];
        const receiverUserMessage = values[1];
        console.log(receiverUserMessage)
        if(myUserMessage){
            let exist = myUserMessage.receivers.find(it => it.toString() === receiver);
            if(!exist) {
                myUserMessage.receivers.push(receiver);
                await myUserMessage.save();
            }
        }else{
            await UserMessage.create({
                owner: id,
                receivers: [receiver]
            })
        }
        if(receiverUserMessage){
            let exist = receiverUserMessage.receivers.find(it => it.toString() === id);
            if(!exist){
                receiverUserMessage.receivers.push(id);
                await receiverUserMessage.save()
            } 
           
        }else{
            await UserMessage.create({
                owner: receiver,
                receivers: [id]
            })
        }
        const data = await User.findOne({_id: receiver});
        res.status(200).json({
            error: false,
            data: data
        })
        
       } catch (error) {
        console.log(error)
        res.status(500).json({
            error: true,
            message: 'Internal Server Error'
        })
       }
        
    }
}
export default messageCtrl;