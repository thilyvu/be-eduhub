const {Router } = require('express')
const {  createSubject,
  updateSubject,
  deleteSubject,
  getListSubject,
  getSubjectById,}= require ("../../../util/masterData/subject");


const router = Router()

router.post('/subject', async ( req,res)=>{
  await createSubject(req,res)
});
router.get('/subject', async (req,res)=>{
 await getListSubject(req,res)
})

router.get('/subjectById/:id', async (req,res)=>{
  await getSubjectById(req,res)
 })
 
router.put('/subject/:id',  async ( req,res)=>{
 await updateSubject(req,res)
});
router.delete('/subject/:id', async ( req,res)=>{
 await deleteSubject(req,res)
});;

module.exports = router;