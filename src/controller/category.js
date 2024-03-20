import Category from "../models/category";
const categoryCtl = {
    getAll: async (req, res) => {
        try {
            let categories = await Category.find({});
            res.status(200).json({
                error: false,
                data: categories
            })
        } catch (error) {
            res.status(500).json({
                error: true,
                message: 'error'
            })
        }
    },
    insert: async (req, res) => {
        try {
            let list = req.body?.categories;
            if(list){
                let saveData = await Category.insertMany(list);
                console.log(JSON.stringify(saveData));
                res.status(200).json({
                    error: false,
                    message: 'insert success'
                })
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            })
        }

    }
}
export default categoryCtl;