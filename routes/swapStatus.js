const db = require('../config');

const DutySwap = (req, res) => {
    const { bioId } = req.body;
    if (!bioId) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            swapDutyData: []
        });
    }

    const swapQuery = `
        SELECT d.id AS swapId,e.employee_name as empName, d.shift, d.swipe_details AS swipesData, 
       	e.phone as contact, d.duty_status AS dutyStatus, d.startdate AS date , d.exchange_status as exchangeStatus
        FROM duty_details d JOIN emp_ref e on e.bio_id = d.request_to
        WHERE d.duty_exchanged = "YES" AND d.request_from = ?`;

    db.query(swapQuery, [bioId], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Internal Server Error ${err.message}`,
                swapDutyData: []
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
                swapDutyData: result
            });
        } else {
            return res.status(200).json({
                status: true,
                message: "No data found",
                swapDutyData: []
            });
        }
    });
};

function parseSwipeDetails(swipeDetails) {
    const parsed = {};
    const regex = /Day (\d+) - Swipe Time - (\d{2}:\d{2})/g;
    let match;

    while ((match = regex.exec(swipeDetails)) !== null) {
        const day = `Day ${match[1]}`;
        const time = match[2];
        
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
