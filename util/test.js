const Test = require("../models/test");
const {   testCreateSchema ,
    testUpdateSchema,} = require('../helper/validation_test')
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
const createTest = async (req, res) =>{
 try {
    const result = await testCreateSchema.validateAsync(req.body);
    const newTest = new Test ({
      ...result,
      createBy : req.user._id,
    })
    await newTest.save();
    return res.status(201).json({
      message: "New test create successful ",
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
const updateTest =async (req, res) =>{ 

  try {

    const result = await testUpdateSchema.validateAsync(req.body);
    const oldTest = await Test.findById(req.params.id);
    if(result.testName !== oldTest.testName) {
      let testnameNotTaken = await testValidation(result.testName);
      if( !testnameNotTaken){
        return  res.status(400).json({
          message: `Test name have already taken`,
          success: false 
        }) 
      }
    }
    const updateTest = {
      ...result,
      updateBy : req.user.id
    }
    const updatedTest = await Object.assign(oldTest,updateTest)
    if (!updatedTest) return null;
    await updatedTest.save();
    return res.status(201).json({
      message: "Test update successful ",
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

const testValidation = async testName =>{
    let oldName = await Test.findOne({"testName" : testName});
    return oldName ? false: true;
  }

const getListTest = async (req, res)=>{
  try {
    
    const features = new APIfeatures(Test.find(), req.query)
      .filtering().sorting().paginating()
  
      const listTest = await features.query
      return res.status(201).json({
        message: "Get list test successful",
        success: true,
        data :listTest,
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
const getTestById = async (req, res) => { 
  try {
    const likeTest = await Test.findById(req.params.id)
    if(!likeTest) return res.status(400).json({msg: "Test does not exist."})

    res.json({
      status: 'success',
      data: likeTest
  })
    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
}

const deleteTest = async (req, res)=>{
    try {
      const testNeedDelete = await Test.findById(req.params.id);
      if(!testNeedDelete){
        return res.status(404).json({
          message: "Test not found. Invalid id of Test",
          success: false
        })
      }
      await Test.remove(testNeedDelete)
      return res.status(201).json({
        message: "Test successfully deleted",
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
  createTest,
  updateTest,
  deleteTest,
  getListTest,
  getTestById,
};