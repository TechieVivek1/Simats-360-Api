const db = require('../config');

const DutySwap = (req, res) => {
    const { bioId } = req.body;
    if (!bioId) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            swapDutyNotificationData: []
        });
    }

    const swapQuery = `
        SELECT id AS swapId, employee_name AS empName, shift, swipe_details AS swipesData, 
               contact, duty_status AS dutyStatus, updated_at AS date 
        FROM duty_details 
        WHERE duty_exchanged = "YES" AND request_to = ? and exchange_status = 'Pending'
        AND startdate > curdate()
    `;

    db.query(swapQuery, [bioId], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Internal Server Error ${err.message}`,
                swapDutyNotificationData: []
            });
        }

        if (result.length > 0) {
            result.forEach(item => {
                item.swipesData = parseSwipeDetails(item.swipesData); 
                item.date = formatToLocalDate(item.date); 
            });

            return res.status(200).json({
                status: true,
                message: "Data Fetched Successfully",
                swapDutyNotificationData: result
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "No data found",
                swapDutyNotificationData: []
            });
        }
    });
};

function parseSwipeDetails(swipeDetails) {
    const parsed = {};
    const regex = /Day\s+(\d+)\s+-\s+Swipe Time\s+-\s+(\d{2}:\d{2})/g; 
    let match;

    while ((match = regex.exec(swipeDetails)) !== null) {
        const day = `Day ${match[1]}`;
        const time = match[2].trim(); 
        
        if (!parsed[day]) {
            parsed[day] = [];
        }
        parsed[day].push({ "swipeTime": time });
    }

    return Object.keys(parsed).map(day => ({ day, swipes: parsed[day] }));
}

function formatToLocalDate(date) {
    if (!date) return null;
    const localDate = new Date(date);
    return localDate.toLocaleDateString('en-CA'); 
}

module.exports = DutySwap;
