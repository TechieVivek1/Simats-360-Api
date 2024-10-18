
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


const attendance =  require('../routes/attendance')
router.post('/attendance',attendance);

const attendanceResvised =  require('../routes/logicfromphpAttendance');
router.post('/attendanceRevised',attendanceResvised);

const homeDetailsInfo = require('../routes/homeDetails')
router.post('/homeDetails',homeDetailsInfo)

const homeCopy  = require('../routes/homeCopy')
router.post('/homeCopy',homeCopy)

module.exports = router
