const {Router } = require('express')
const {userAuth}= require ("../../util/auth");
const {  createProvince,
  updateProvince,
  deleteProvince,
  getListProvince,
  getProvinceById,}= require ("../../util/masterData/province");


const router = Router()

router.post('/province',userAuth, async ( req,res)=>{
  await createProvince(req,res)
});
router.get('/province',userAuth, async (req,res)=>{
 await getListProvince(req,res)
})

router.get('/provinceById/:id',userAuth, async (req,res)=>{
  await getProvinceById(req,res)
 })
 
router.put('/province/:id',userAuth,  async ( req,res)=>{
 await updateProvince(req,res)
});
router.delete('/province/:id',userAuth, async ( req,res)=>{
 await deleteProvince(req,res)
});;

module.exports = router;