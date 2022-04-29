const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {createPool,
  updatePool,
  deletePool,
  getListPool,
  getPoolById}= require ("../../util/pool");


const router = Router()

router.post('/pool',userAuth, async ( req,res)=>{
  await createPool(req,res)
});
router.get('/pool',userAuth, async (req,res)=>{
 await getListPool(req,res)
})

router.get('/poolById/:id',userAuth, async (req,res)=>{
  await getPoolById(req,res)
 })
 
router.put('/pool/:id',userAuth,  async ( req,res)=>{
 await updatePool(req,res)
});
router.delete('/pool/:id',userAuth, async ( req,res)=>{
 await deletePool(req,res)
});;

module.exports = router;