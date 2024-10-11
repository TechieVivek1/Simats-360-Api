
const express =  require('express');

const router = express.Router();

const userInfo = require('../routes/user_info')


router.post('/userInfo',userInfo)

module.exports = router
