const School = require("../../models/masterData/school");
const {   schoolCreateSchema ,
  schoolUpdateSchema,} = require('../../helper/masterData/validation_school')
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
const createSchool = async (req, res) =>{
 try {
    const result = await schoolCreateSchema.validateAsync(req.body);
    const newSchool = new School ({
      ...result,
      createBy : req.user._id,
    })
    await newSchool.save();
    return res.status(201).json({
      message: "New school create successful ",
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
const updateSchool =async (req, res) =>{ 

  try {

    const result = await schoolUpdateSchema.validateAsync(req.body);
    const oldSchool = await School.findById(req.params.id);
    if(result.name !== oldSchool.name) {
      let schoolnameNotTaken = await schoolNameValidation(result.name);
      if( !schoolnameNotTaken){
        return  res.status(400).json({
          message: `School name have already taken`,
          success: false 
        }) 
      }
    }
    const updateSchool = {
      ...result,
      updateBy : req.user.id
    }
    const updatedSchool = await Object.assign(oldSchool,updateSchool)
    if (!updatedSchool) return null;
    await updatedSchool.save();
    return res.status(201).json({
      message: "School update successful ",
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

const schoolNameValidation = async schoolname =>{
    let oldSchool = await School.findOne({"name" : schoolname});
    return oldSchool ? false: true;
  }

const getListSchool = async (req, res)=>{
  try {
    
    const features = new APIfeatures(School.find(), req.query)
      .filtering().sorting().paginating()
  
      const listSchool = await features.query
      return res.status(201).json({
        message: "Get list school successful",
        success: true,
        data :listSchool,
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
const getSchoolById = async (req, res) => { 
  try {
    const likeSchool = await School.findById(req.params.id)
    if(!likeSchool) return res.status(400).json({msg: "School does not exist."})

    res.json({
      status: 'success',
      data: likeSchool
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteSchool = async (req, res)=>{
    try {
      const school = await School.findById(req.params.id);
      if(!school){
        return res.status(404).json({
          message: "school not found. Invalid id of school",
          success: false
        })
      }
      await School.remove(school)
      return res.status(201).json({
        message: "school successfully deleted",
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
  createSchool,
  updateSchool,
  deleteSchool,
  getListSchool,
  getSchoolById,
};