const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {createLecture,
  updateLecture,
  deleteLecture,
  getListLecture,
  getLectureById}= require ("../../util/lecture");


const router = Router()

router.post('/lecture',userAuth, async ( req,res)=>{
  await createLecture(req,res)
});
router.get('/lecture',userAuth, async (req,res)=>{
 await getListLecture(req,res)
})

router.get('/lectureById/:id',userAuth, async (req,res)=>{
  await getLectureById(req,res)
 })
 
router.put('/lecture/:id',userAuth,  async ( req,res)=>{
 await updateLecture(req,res)
});
router.delete('/lecture/:id',userAuth, async ( req,res)=>{
 await deleteLecture(req,res)
});;

module.exports = router;