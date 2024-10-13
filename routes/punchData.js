
const axios = require('axios');
const moment = require('moment-timezone'); 

function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); 
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

async function punchData(userId) {
    const punch_url = process.env.PUNCH_URL;
    const url = punch_url + userId;
    
    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.status) {
            return { status: false, message: 'No data found' };
        }

        const attendanceRecords = data.attendance;
        const result = {};
        const now = moment();
        const startPreviousMonth = moment().subtract(1, 'month').date(21);
        const endPreviousMonth = startPreviousMonth.clone().endOf('month');
        const startCurrentMonth = moment().startOf('month');
        const endCurrentMonth = moment().date(20);

        attendanceRecords.forEach(record => {
            const logDate = moment.tz(record.LogDate.date, "Asia/Kolkata");
            const formattedDate = formatDate(logDate.toDate());
            
            // Check if the logDate is in the desired range
            if (
                (logDate.isBetween(startPreviousMonth, endPreviousMonth, null, '[]')) || // Previous month from 21st
                (logDate.isBetween(startCurrentMonth, endCurrentMonth, null, '[]')) // Current month up to 20th
            ) {
                if (!result[formattedDate]) {
                    result[formattedDate] = {
                        date: formattedDate,
                        time: {}
                    };
                }

                const timeKey = formatTime(logDate.toDate());
                result[formattedDate].time[timeKey] = record.C1;
            }
        });

        let finalResult = Object.values(result);
        finalResult.sort((a, b) => moment(b.date, "DD-MM-YYYY").diff(moment(a.date, "DD-MM-YYYY")));

        return {status:true,data:finalResult};
    } catch (error) {
        return { status: false, message: 'Error fetching punch data' };
    }
}


module.exports = punchData


