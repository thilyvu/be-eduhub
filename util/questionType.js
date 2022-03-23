const QuestionType = require("../models/questionType");
const {   questionTypeCreateSchema ,
  questionTypeUpdateSchema,} = require('../helper/validation_questionType')
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
const createQuestionType = async (req, res) =>{
 try {
    const result = await questionTypeCreateSchema.validateAsync(req.body);
    const newQuestionType = new QuestionType ({
      ...result,
      createBy : req.user._id,
    })
    await newQuestionType.save();
    return res.status(201).json({
      message: "New question type create successful ",
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
const updateQuestionType =async (req, res) =>{ 

  try {

    const result = await questionTypeUpdateSchema.validateAsync(req.body);
    const oldQuestionType = await QuestionType.findById(req.params.id);
    if(result.questionTypeName !== oldQuestionType.questionTypeName) {
      let questionTypenameNotTaken = await questionTypeValidation(result.questionTypeName);
      if( !questionTypenameNotTaken){
        return  res.status(400).json({
          message: `QuestionType name have already taken`,
          success: false 
        }) 
      }
    }
    const updateQuestionType = {
      ...result,
      updateBy : req.user.id
    }
    const updatedQuestionType = await Object.assign(oldQuestionType,updateQuestionType)
    if (!updatedQuestionType) return null;
    await updatedQuestionType.save();
    return res.status(201).json({
      message: "QuestionType update successful ",
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

const questionTypeValidation = async questionTypeName =>{
    let oldQuestionType = await QuestionType.findOne({"questionTypeName" : questionTypeName});
    return oldQuestionType ? false: true;
  }

const getListQuestionType = async (req, res)=>{
  try {
    
    const features = new APIfeatures(QuestionType.find(), req.query)
      .filtering().sorting().paginating()
  
      const listQuestionType = await features.query
      return res.status(201).json({
        message: "Get list questionType successful",
        success: true,
        data :listQuestionType,
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
const getQuestionTypeById = async (req, res) => { 
  try {
    const likeQuestionType = await QuestionType.findById(req.params.id)
    if(!likeQuestionType) return res.status(400).json({msg: "QuestionType does not exist."})

    res.json({
      status: 'success',
      data: likeQuestionType
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteQuestionType = async (req, res)=>{
    try {
      const questionType = await QuestionType.findById(req.params.id);
      if(!questionType){
        return res.status(404).json({
          message: "QuestionType not found. Invalid id of QuestionType",
          success: false
        })
      }
      await QuestionType.remove(questionType)
      return res.status(201).json({
        message: "QuestionType successfully deleted",
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
  createQuestionType,
  updateQuestionType,
  deleteQuestionType,
  getListQuestionType,
  getQuestionTypeById,
};