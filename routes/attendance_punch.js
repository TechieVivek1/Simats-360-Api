const axios = require('axios');
const moment = require('moment');

async function fetchAttendance(userId, url) {
    try {
        const response = await axios.get(`${url}${userId}`);
        if(!response.status){
            return { message : 'Failed to fetch attendance', status: response.status};
        }
        const attendanceData = response.data;

        const startDate = moment().subtract(1, 'month').date(20).startOf('day');
        const endDate = moment().date(20).endOf('day');
        
        const logMap = new Map();

        attendanceData.attendance.forEach((entry) => {
            const logDate = moment(entry.LogDate.date);
            const dateKey = logDate.format('YYYY-MM-DD');

            if (logDate.isBetween(startDate, endDate, undefined, '[]')) {
                if (!logMap.has(dateKey)) {
                    logMap.set(dateKey, { punchIn: null, punchOut: null });
                }

                const logEntry = logMap.get(dateKey);

                if (entry.C1 === 'in') {
                    logEntry.punchIn = logDate.format('HH:mm:ss');
                } else if (entry.C1 === 'out') {
                    logEntry.punchOut = logDate.format('HH:mm:ss');
                }
            }
        });

        const result = [];
        logMap.forEach((value, key) => {
            result.push({
                date: key,
                lastPunchIn: value.punchIn || 'N/A',
                lastPunchOut: value.punchOut || 'N/A'
            });
        });

        return result; 
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        return { message: 'Failed to fetch attendance data.' };
    }
}

fetchAttendance(3737,process.env.ATTENDANCE_URL)

module.exports = fetchAttendance;
