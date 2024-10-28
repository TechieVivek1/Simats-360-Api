
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

const monthlySalary = require('../routes/monthlySalaryReport')
router.post('/monthlySalaryReport',monthlySalary)

const fetchHolidays = require('../routes/fetchHolidays')
router.post('/fetchHolidays',fetchHolidays)

//get available leave
const getAvailableLeave = require('../routes/get_employee_leaves')
router.post('/getAvailableLeave', getAvailableLeave)

//get leave recors
const getLeaveRecords = require('../routes/get_leave_recors')
router.post('/getLeaveRecords', getLeaveRecords)

//apply leave
const applyLeave = require('../routes/apply_leave')
router.post('/applyLeave', applyLeave)

// MonthlyBufferDetails
const monthlyBufferDetails = require('../routes/fetchMonthBufferDetails')
router.post('/monthlyBufferDetails', monthlyBufferDetails)

//HomeInfo

const homeInfo = require('../routes/Homeinfo')
router.post('/homeInfo', homeInfo)

const generalNotification = require('../routes/announcement_notifications')
router.get('/generalNotification',generalNotification)


const approvalNotification = require('../routes/approval_notification')
router.post('/approvalNotification',approvalNotification)

const swapDutyNotification = require('../routes/swap_duty_notification')
router.post('/swapDutyNotification',swapDutyNotification)
module.exports = router
