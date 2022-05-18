const Grade = require("../../models/masterData/grade");
const {   gradeCreateSchema ,
  gradeUpdateSchema,} = require('../../helper/masterData/validation_grade')
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
      const limit = this.queryString.limit * 1 || 20
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit)
      return this;
  }
}
const createGrade = async (req, res) =>{
 try {
    const result = await gradeCreateSchema.validateAsync(req.body);
    const newGrade = new Grade ({
      ...result,
      createBy : req.user._id,
    })
    await newGrade.save();
    return res.status(201).json({
      message: "New grade create successful ",
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
const updateGrade =async (req, res) =>{ 

  try {

    const result = await gradeUpdateSchema.validateAsync(req.body);
    const oldGrade = await Grade.findById(req.params.id);
    if(result.name !== oldGrade.name) {
      let gradenameNotTaken = await gradeNameValidation(result.name);
      if( !gradenameNotTaken){
        return  res.status(400).json({
          message: `Grade name have already taken`,
          success: false 
        }) 
      }
    }
    const updateGrade = {
      ...result,
      updateBy : req.user.id
    }
    const updatedGrade = await Object.assign(oldGrade,updateGrade)
    if (!updatedGrade) return null;
    await updatedGrade.save();
    return res.status(201).json({
      message: "Grade update successful ",
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

const gradeNameValidation = async gradename =>{
    let oldGrade = await Grade.findOne({"name" : gradename});
    return oldGrade ? false: true;
  }

const getListGrade = async (req, res)=>{
  try {
    
    const features = new APIfeatures(Grade.find(), req.query)
      .filtering().sorting().paginating()
  
      const listGrade = await features.query
      return res.status(201).json({
        message: "Get list grade successful",
        success: true,
        data :listGrade,
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
const getGradeById = async (req, res) => { 
  try {
    const likeGrade = await Grade.findById(req.params.id)
    if(!likeGrade) return res.status(400).json({msg: "Grade does not exist."})

    res.json({
      status: 'success',
      data: likeGrade
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteGrade = async (req, res)=>{
    try {
      const grade = await Grade.findById(req.params.id);
      if(!grade){
        return res.status(404).json({
          message: "Grade not found. Invalid id of Grade",
          success: false
        })
      }
      await Grade.remove(grade)
      return res.status(201).json({
        message: "grade successfully deleted",
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
  createGrade,
  updateGrade,
  deleteGrade,
  getListGrade,
  getGradeById,
};