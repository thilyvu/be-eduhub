const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {createLecture,
  updateLecture,
  deleteLecture,
  getListLecture,
  getLectureById}= require ("../../util/masterData/school");


const router = Router()

router.post('/school',userAuth, async ( req,res)=>{
  await createLecture(req,res)
});
router.get('/school',userAuth, async (req,res)=>{
 await getListLecture(req,res)
})

router.get('/schoolById/:id',userAuth, async (req,res)=>{
  await getLectureById(req,res)
 })
 
router.put('/school/:id',userAuth,  async ( req,res)=>{
 await updateLecture(req,res)
});
router.delete('/school/:id',userAuth, async ( req,res)=>{
 await deleteLecture(req,res)
});;

module.exports = router;