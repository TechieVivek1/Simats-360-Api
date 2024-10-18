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
                        time: {}
                    };
                }

                const timeKey = logDate.format('HH:mm:ss');
                result[formattedDate].time[timeKey] = record.C1;
                attendanceDates.add(formattedDate);
            }
        });

        // Fill in missing dates in the result
        let current = startDate.clone();

        while (current.isSameOrBefore(adjustedEndDate)) {
            const formattedDate = formatDate(current.toDate());
            
            if (!attendanceDates.has(formattedDate)) {
                result[formattedDate] = {
                    date: formattedDate,
                    time: {}
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
