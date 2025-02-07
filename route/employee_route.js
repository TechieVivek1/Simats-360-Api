
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

const {ho,ap} = require('../routes/homeDetails')
router.post('/homeDetails',ho)
router.post('/homeDetails/applyLeave',ap)

const {homeInfo,updateAttendance } = require('../routes/homeCopy')
router.post('/homeCopy',homeInfo)
router.post('/homeCopy/updateAttendance',updateAttendance)

const monthlySalary = require('../routes/monthlySalaryReport')
router.post('/monthlySalaryReport',monthlySalary)

const fetchHolidays = require('../routes/fetchHolidays')
router.post('/fetchHolidays',fetchHolidays)

//get available leave
const getAvailableLeave = require('../routes/get_employee_leaves')
router.post('/getAvailableLeave', getAvailableLeave)

//get leave recors
const getLeaveRecords = require('../routes/get_leave_records')
router.post('/getLeaveRecords', getLeaveRecords)

//apply leave
const applyLeave = require('../routes/applyLeaveModified')
router.post('/applyLeave', applyLeave)

// MonthlyBufferDetails
const monthlyBufferDetails = require('../routes/fetchMonthBufferDetails')
router.post('/monthlyBufferDetails', monthlyBufferDetails)

//HomeInfo
const homeAttendance = require('../routes/Homeinfo')
router.post('/homeInfo', homeAttendance)

const generalNotification = require('../routes/announcement_notifications')
router.post('/generalNotification',generalNotification)


const approvalNotification = require('../routes/approval_notification')
router.post('/approvalNotification',approvalNotification)

//pendingDutyClaimsCount 
const  pendingDutyClaimsCount = require('../routes/pendingDutyClaimsCount')
router.post('/pendingDutyClaimsCount',pendingDutyClaimsCount)

// pending Duty
const  pendingDuty = require('../routes/pendingDuty')
router.post('/pendingDuty',pendingDuty)

const swapDutyNotification = require('../routes/swap_duty_notification')
router.post('/swapDutyNotification',swapDutyNotification)

const pendingDutyCount = require('../routes/pendingDutyCounts')
router.post('/pendingDutyCount',pendingDutyCount)

// duty claims
const dutyClaims = require('../routes/dutyClaims')
router.post('/dutyClaims',dutyClaims)

// group Options
const groupOptions = require('../routes/groupOptions')
router.post('/groupOptions',groupOptions)

// duty Roster
const dutyRoster = require('../routes/dutyRoster')
router.post('/dutyRoster',dutyRoster)

// swap duty
const swapDuty = require('../routes/swapDuty')
router.post('/swapDuty',swapDuty)

// leave approval
const leaveApproval = require('../routes/leaveApproval')
router.post('/leaveApproval',leaveApproval)

// swapApproval
const swapApproval = require('../routes/swapApproval')
router.post('/swapApproval',swapApproval)

// apply leave modified
const applyLeaveModified = require('../routes/apply_leave')
router.post('/applyLeaveModified',applyLeaveModified)

// swap status
const swapStatus = require('../routes/swapStatus')
router.post('/swapStatus',swapStatus)

//General duties
const generalDuties = require('../routes/GeneralDuty')
router.post('/generalDuty',generalDuties)

// claimHolidayCredits 
const claimHolidayCredits = require('../routes/claimHolidayCredits')
router.post('/claimHolidayCredits',claimHolidayCredits)

// requestClaimHolidays
const requestClaimHolidays = require('../routes/requestClaimHoliday')
router.post('/requestClaimHoliday',requestClaimHolidays)

//generalDutySwapStatus
const generalDutySwapStatus = require('../routes/generalDutySwapStatus')
router.post('/generalDutySwapStatus',generalDutySwapStatus)

// generalDutySwap
const generalDutySwap = require('../routes/swapGeneralDuty')
router.post('/generalDutySwap',generalDutySwap)

// Mid Duty 
const midDuty = require('../routes/MidDuty')
router.post('/midDuty',midDuty)

// general pending duty count
const generalPendingDutyCount = require('../routes/GeneralDutyCount')
router.post('/generalPendingDutyCount',generalPendingDutyCount)

// 


module.exports = router
