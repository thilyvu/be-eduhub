const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {createScore,
  updateScore,
  deleteScore,
  getListScore,
  getScoreById,
  getListExerciseScore}= require ("../../util/score");


const router = Router()

router.post('/score',userAuth, async ( req,res)=>{
  await createScore(req,res)
});
router.get('/score',userAuth, async (req,res)=>{
 await getListScore(req,res)
})

router.get('/scoreById/:id',userAuth, async (req,res)=>{
  await getScoreById(req,res)
 })
 
router.put('/score/:id',userAuth,  async ( req,res)=>{
 await updateScore(req,res)
});
router.delete('/score/:id',userAuth, async ( req,res)=>{
 await deleteScore(req,res)
});;
router.get("/scoreByExerciseId/:exerciseId", userAuth, async (req, res) => {
  await getListExerciseScore(req, res);
});

module.exports = router; 