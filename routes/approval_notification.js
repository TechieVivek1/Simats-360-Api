const { result } = require('lodash')
const db = require('../config')

const approvalNotification = (req,res) => {
    const {bioId} = req.body 
    const {campus} = req.body
    const fetchQuery = 'select * from apply_leave a left join emp_ref e on a.bio_id = e.bio_id where a.campus = ? and a.assigned_head_id = ?'
    if (!bioId || !campus) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            notificationData: []
        })
    }
    db.query(fetchQuery,[campus,bioId],(err,result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Internal Server Issue ${err.message}`,
                notificationData: []
            })
        }

        if (result.length > 0) {
            return res.status(200).json({
                status: true,
                message: "Notification Fetched Successfully",
                notificationData: result
            })
        } else {
            return res.status(200).json({
                status: false,
                message: "No Data Found",
                notificationData: result
            })
        }
    })
}

module.exports = approvalNotification