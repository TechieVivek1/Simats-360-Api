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
            // Process swipe details and format date for each result item
            result.forEach(item => {
                item.swipesData = parseSwipeDetails(item.swipesData); // Parse and structure swipe details
                item.date = formatToLocalDate(item.date); // Format date to 'YYYY-MM-DD'
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

// Helper function to parse swipe details
function parseSwipeDetails(swipeDetails) {
    const parsed = {};
    const regex = /Day\s+(\d+)\s+-\s+Swipe Time\s+-\s+(\d{2}:\d{2})/g; // Improved regex with flexible spacing
    let match;

    while ((match = regex.exec(swipeDetails)) !== null) {
        const day = `Day ${match[1]}`;
        const time = match[2].trim(); // Remove extra spaces if any
        
        if (!parsed[day]) {
            parsed[day] = [];
        }
        parsed[day].push({ "swipeTime": time });
    }

    // Convert the object to an array of day objects
    return Object.keys(parsed).map(day => ({ day, swipes: parsed[day] }));
}

// Helper function to format date to local date format (YYYY-MM-DD)
function formatToLocalDate(date) {
    if (!date) return null;
    const localDate = new Date(date);
    return localDate.toLocaleDateString('en-CA'); // Formats as YYYY-MM-DD
}

module.exports = DutySwap;
