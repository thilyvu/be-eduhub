const Subject = require("../../models/masterData/subject");
const {    subjectCreateSchema,
  subjectUpdateSchema,} = require('../../helper/masterData/validation_subject')
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
const createSubject = async (req, res) =>{
 try {
    const result = await subjectCreateSchema.validateAsync(req.body);
    const newSubject = new Subject ({
      ...result,
      createBy : req.user._id,
    })
    await newSubject.save();
    return res.status(201).json({
      message: "New subject create successful ",
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
const updateSubject =async (req, res) =>{ 

  try {

    const result = await subjectUpdateSchema.validateAsync(req.body);
    const oldSubject = await Subject.findById(req.params.id);
    if(result.name !== oldSubject.name) {
      let subjectnameNotTaken = await subjectNameValidation(result.name);
      if( !subjectnameNotTaken){
        return  res.status(400).json({
          message: `Subject name have already taken`,
          success: false 
        }) 
      }
    }
    const updateSubject = {
      ...result,
      updateBy : req.user.id
    }
    const updatedSubject = await Object.assign(oldSubject,updateSubject)
    if (!updatedSubject) return null;
    await updatedSubject.save();
    return res.status(201).json({
      message: "Subject update successful ",
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

const subjectNameValidation = async subjectname =>{
    let oldSubject = await Subject.findOne({"name" : subjectname});
    return oldSubject ? false: true;
  }

const getListSubject = async (req, res)=>{
  try {
    
    const features = new APIfeatures(Subject.find(), req.query)
      .filtering().sorting().paginating()
  
      const listSubject = await features.query
      return res.status(201).json({
        message: "Get list subject successful",
        success: true,
        data :listSubject,
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
const getSubjectById = async (req, res) => { 
  try {
    const likeSubject = await Subject.findById(req.params.id)
    if(!likeSubject) return res.status(400).json({msg: "Subject does not exist."})

    res.json({
      status: 'success',
      data: likeSubject
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteSubject = async (req, res)=>{
    try {
      const subject = await Subject.findById(req.params.id);
      if(!subject){
        return res.status(404).json({
          message: "Subject not found. Invalid id of Subject",
          success: false
        })
      }
      await Subject.remove(subject)
      return res.status(201).json({
        message: "Subject successfully deleted",
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
  createSubject,
  updateSubject,
  deleteSubject,
  getListSubject,
  getSubjectById,
};