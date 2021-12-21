const Province = require("../../models/masterData/province");
const {   provinceCreateSchema ,
  provinceUpdateSchema,} = require('../../helper/masterData/validation_province')
class APIfeatures {
  constructor(query, queryString){
      this.query = query;
      this.queryString = queryString;
  }
  filtering(){
     const queryObj = {...this.queryString} //queryString = req.query

     const excludedFields = ['page', 'sort', 'limit']
     excludedFields.forEach(el => delete(queryObj[el]))
     
     let queryStr = JSON.stringify(queryObj)
     queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)

  //    gte = greater than or equal
  //    lte = lesser than or equal
  //    lt = lesser than
  //    gt = greater than
     this.query.find(JSON.parse(queryStr))
       
     return this;
  }

  sorting(){
      if(this.queryString.sort){
          const sortBy = this.queryString.sort.split(',').join(' ')
          this.query = this.query.sort(sortBy)
      }else{
          this.query = this.query.sort('-createdAt')  
      }

      return this;
  }

  paginating(){
      const page = this.queryString.page * 1 || 1
      const limit = this.queryString.limit * 1 || 9
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit)
      return this;
  }
}
const createProvince = async (req, res) =>{
 try {
    const result = await provinceCreateSchema.validateAsync(req.body);
    const newProvince = new Province ({
      ...result,
      createBy : req.user._id,
    })
    await newProvince.save();
    return res.status(201).json({
      message: "New province create successful ",
      success: true
    })
 }
 catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }
};
const updateProvince =async (req, res) =>{ 

  try {

    const result = await provinceUpdateSchema.validateAsync(req.body);
    const oldProvince = await Province.findById(req.params.id);
    if(result.name !== oldProvince.name) {
      let provincenameNotTaken = await provinceNameValidation(result.name);
      if( !provincenameNotTaken){
        return  res.status(400).json({
          message: `Province name have already taken`,
          success: false 
        }) 
      }
    }
    const updateProvince = {
      ...result,
      updateBy : req.user.id
    }
    const updatedProvince = await Object.assign(oldProvince,updateProvince)
    if (!updatedProvince) return null;
    await updatedProvince.save();
    return res.status(201).json({
      message: "Province update successful ",
      success: true
    })
 }
 catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }
}

const provinceNameValidation = async provincename =>{
    let oldProvince = await Province.findOne({"name" : provincename});
    return oldProvince ? false: true;
  }

const getListProvince = async (req, res)=>{
  try {
    
    const features = new APIfeatures(Province.find(), req.query)
      .filtering().sorting().paginating()
  
      const listProvince = await features.query
      return res.status(201).json({
        message: "Get list province successful",
        success: true,
        data :listProvince,
      })
  }
  catch (err){
    if(err.isJoi === true){
      return res.status(444).json({
        message: err.message,
        success: false
      }) 
    }
    return res.status(500).json({
      message: err.message,
      success: false
    })
 }

}
const getProvinceById = async (req, res) => { 
  try {
    const likeProvince = await Province.findById(req.params.id)
    if(!likeProvince) return res.status(400).json({msg: "Province does not exist."})

    res.json({
      status: 'success',
      data: likeProvince
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteProvince = async (req, res)=>{
    try {
      const province = await Province.findById(req.params.id);
      if(!province){
        return res.status(404).json({
          message: "Province not found. Invalid id of Province",
          success: false
        })
      }
      await Province.remove(province)
      return res.status(201).json({
        message: "province successfully deleted",
        success: true
      })
    }
    catch(err){
      return res.status(500).json({
        message: err.message,
        success: false
      })
    }
  }
module.exports= {
  createProvince,
  updateProvince,
  deleteProvince,
  getListProvince,
  getProvinceById,
};