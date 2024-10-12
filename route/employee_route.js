
const express =  require('express');

const router = express.Router();

const userInfo = require('../routes/user_info')


router.post('/userInfo',userInfo)


const  home = require('../routes/home')
router.post('/home',home)

module.exports = router
