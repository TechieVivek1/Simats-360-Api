
const express =  require('express');
const router = express.Router();

// login
const login = require('../routes/login')
router.post('/login',login)

// salaryReport
const salaryReport = require('../routes/salaryReports')
router.post('/salaryReports',salaryReport)

// userInfo
const userInfo = require('../routes/user_info')
router.post('/userInfo',userInfo)

// userHome
const  home = require('../routes/home')
router.post('/home',home)

module.exports = router
