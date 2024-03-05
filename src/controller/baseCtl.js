import db from "../models";
export default class BaseController {
  constructor(modelName){
    this.modelName = modelName;
  }
  
  getAll = async (req, res) => {
    try {
      const data = await this.modelName.findAll();
        return res.status(200).json({
          error: false,
          message: 'get all success',
          data: data
      });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
          error: true,
          message: error.message
        });
      }
  }
  getById = async(req,res) => {
    try{
      const id = req.params.id;
      const data = await this.modelName.findOne({
        where: { id: id}
      });
      return res.status(200).json({
        error: false,
        message: 'get by id success',
        data: data
    });
    }catch(error) {
      console.log(error)
      return res.status(500).json({
        error: true,
        message: error.message
      });
    }
  }
 
}
  
