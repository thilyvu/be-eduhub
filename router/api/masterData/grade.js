const {Router } = require('express')
const {  createGrade,
  updateGrade,
  deleteGrade,
  getListGrade,
  getGradeById,}= require ("../../../util/masterData/grade");


const router = Router()

router.post('/grade', async ( req,res)=>{
  await createGrade(req,res)
});
router.get('/grade', async (req,res)=>{
 await getListGrade(req,res)
})

router.get('/gradeById/:id', async (req,res)=>{
  await getGradeById(req,res)
 })
 
router.put('/grade/:id',  async ( req,res)=>{
 await updateGrade(req,res)
});
router.delete('/grade/:id', async ( req,res)=>{
 await deleteGrade(req,res)
});;

module.exports = router;