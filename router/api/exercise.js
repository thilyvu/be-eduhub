const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {createExercise,
  updateExercise,
  deleteExercise,
  getListExercise,
  getExerciseByClassId,
  getExerciseById}= require ("../../util/exercise");


const router = Router()

router.post('/exercise',userAuth, async ( req,res)=>{
  await createExercise(req,res)
});
router.get('/exercise',userAuth, async (req,res)=>{
 await getListExercise(req,res)
})

router.get('/exerciseById/:id',userAuth, async (req,res)=>{
  await getExerciseById(req,res)
 })
 router.get('/exerciseByClassId/:classId',userAuth, async (req,res)=>{
  await getExerciseByClassId(req,res)
 })
router.put('/exercise/:id',userAuth,  async ( req,res)=>{
 await updateExercise(req,res)
});
router.delete('/exercise/:id',userAuth, async ( req,res)=>{
 await deleteExercise(req,res)
});;

module.exports = router;