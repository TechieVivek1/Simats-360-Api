const db = require('../config')

const DutySwap = (req,res) => {
    const {bioId} = req.body
    if (!bioId) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            swapDutyNotificationData: []
        })
    }
const swapQuery = 'select * from duty_details where duty_exchanged = "YES" and request_to = ?'

db.query(swapQuery,[bioId], (err,result)=> {
    if (err) {
        return res.status(500).json({
            status: false,
            message: `Internal Server Error ${err.message}`,
            swapDutyNotificationData: []
        })
    }

    if (result.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data Fetched Successfully",
            swapDutyNotificationData: result
        })
    } else  {
        return res.status(200).json({
            status: true,
            message: "No data found",
            swapDutyNotificationData: []
        })
    }
})
}
module.exports = DutySwap