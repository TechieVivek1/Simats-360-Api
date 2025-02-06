const axios = require('axios');
const moment = require('moment-timezone');

function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

async function punchData(userId, year, month) {
    const punch_url = process.env.PUNCH_URL;
    const url = `${punch_url}${userId}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.status) {
            return { status: false, message: 'No data found' };
        }

        const attendanceRecords = data.attendance;
        const result = {};
        const now = moment();

        // Calculate the start date (21st of the given month) and end date (20th of the next month)
        const startDate = moment(`${year}-${month}-21`, 'YYYY-MM-DD');
        const endDate = moment(startDate).add(1, 'month').date(20);

        // Ensure we do not fetch future dates if the endDate is after now
        const adjustedEndDate = endDate.isAfter(now) ? now : endDate;

        const attendanceDates = new Set();

        attendanceRecords.forEach(record => {
            const logDate = moment.tz(record.LogDate.date, "Asia/Kolkata");
            const formattedDate = formatDate(logDate.toDate());

            // Check if logDate is between the start and end dates (inclusive)
            if (logDate.isBetween(startDate, adjustedEndDate, null, '[]')) {
                if (!result[formattedDate]) {
                    result[formattedDate] = {
                        date: formattedDate,
                        time: {},
                        halfDay: false // default to false
                    };
                }

                const timeKey = logDate.format('HH:mm:ss');
                attendanceDates.add(formattedDate);

                if (!result[formattedDate].time[timeKey]) {
                    result[formattedDate].time[timeKey] = logDate;
                }
            }
        });

        // Process each day to find one "in" and one "out" and handle half-day logic
        for (let date in result) {
            const times = Object.keys(result[date].time).map(time => moment(result[date].time[time]));
            let inTime = null;
            let outTimes = [];

            // Separate the times before and after 12:00
            times.forEach(time => {
                if (time.isBefore(moment("12:00:00", "HH:mm:ss"))) {
                    if (!inTime) {
                        inTime = time.format("HH:mm:ss"); // Take the earliest punch before 12:00
                    }
                } else {
                    outTimes.push(time); // Collect all punch times after 12:00
                }
            });

            // If there's no valid in-time, we skip processing
            if (!inTime || outTimes.length === 0) {
                result[date].time = {}; // Clear time object if there's no valid punch
                continue;
            }

            // Sort outTimes and take the last one as the valid "out"
            outTimes.sort((a, b) => a - b);
            const outTime = outTimes[outTimes.length - 1].format("HH:mm:ss");

            // Check for half-day condition
            if (outTimes.length > 1) {
                const firstOut = outTimes[0];
                const secondOut = outTimes[1];

                // If two "out" times are within 30 minutes of each other, mark it as half-day
                if (secondOut.diff(firstOut, 'minutes') <= 30) {
                    result[date].halfDay = true;
                }
            }

            // Update result with selected "in" and "out" times
            result[date].time = {
                [inTime]: 'in',
                [outTime]: 'out'
            };
        }

        // Fill in missing dates in the result
        let current = startDate.clone();
        while (current.isSameOrBefore(adjustedEndDate)) {
            const formattedDate = formatDate(current.toDate());

            if (!attendanceDates.has(formattedDate)) {
                result[formattedDate] = {
                    date: formattedDate,
                    time: {},
                    halfDay: false // Ensure "halfDay" is always present, even if no punch data exists
                };
            }
            current.add(1, 'day'); // Move to the next day
        }

        // Convert the result object to an array and sort by date in ascending order
        let finalResult = Object.values(result);
        finalResult.sort((a, b) => moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY")));

        return { status: true, data: finalResult };
    } catch (error) {
        return { status: false, message: 'Error fetching punch data' };
    }
}

module.exports = punchData;
