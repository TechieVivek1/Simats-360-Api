const { result } = require('lodash')
const db = require('../config')

const notification = (req,res) => {
    const query = 'select * from notifications where notification_category = "general"'

    db.query(query, (err,result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                notificationData: []
            })
        }

        if (result.length > 0) {
            return res.status(200).json({
                status: true,
                message: "Notifications fetched Successfully",
                notificationData: result
            })
        } else {
            return res.status(200).json({
                status: false,
                message: "No data found",
                notificationData: []
            })
        }
    })
}

module.exports = notification