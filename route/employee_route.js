
const express =  require('express');

const router = express.Router();

const userInfo = require('../routes/user_info')

const login = require('../routes/login')
router.post('/login',login)

const salaryReport = require('../routes/salaryReports')
router.post('/salaryReports',salaryReport)

router.post('/userInfo',userInfo)

module.exports = router