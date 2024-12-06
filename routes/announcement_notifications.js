const { result } = require('lodash')
const db = require('../config')

const notification = (req, res) => {

    const { campus } = req.body

    if (!campus) {
        return res.status(400).json({ message: "Campus is required" })
    }

    const query = `SELECT *
        FROM notifications
        WHERE campus = ?
        AND notification_created_at BETWEEN DATE_ADD(CURRENT_DATE, INTERVAL - 5 DAY) AND CURRENT_DATE`;


    db.query(query, [campus], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                notificationData: []
            })
        }

        if (result.length > 0) {

            result = result.map((notify)=>{
                
                const startDate = new Date(notify.notification_created_at).toLocaleDateString('en-CA'); 

                return {
                    ...notify,
                    notification_created_at : startDate }
            })

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