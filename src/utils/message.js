import Message from '../models/message'

export const messageService = {
    getMessages : (owner, receiver) => {
        return new Promise((resolve, reject) => {
            if(receiver && owner)
                Message.find({$or: [
                    { owner: owner, receiver: receiver },
                    { owner: receiver, receiver: owner }
                ]}).sort({created: 1})
                .then(res => { console.log(res); resolve(res)})
                .catch(err => reject(err))
        })
    },
    saveMessage: (content,owner, receiver) => {
        const data = {
            content,
            owner, 
            receiver
        }
        return new Promise((resolve, reject) => {
            Message.create(data)
            .then(res => { resolve(res)})
            .catch(err => reject(err))
        })
    }
}