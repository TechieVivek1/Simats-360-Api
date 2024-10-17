const con = require("../config");
const punchData = require('./punchData');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift');
const buffData = require('./bufferTime');
const holiday = require('./holidays');

// Helper function to calculate the total punch-in time for a given day
const calculatePunchDuration = (punchTimes) => {
    const times = Object.keys(punchTimes).sort(); // Sort the times
    let totalDuration = 0;

    for (let i = 0; i < times.length - 1; i += 2) {
        const inTime = new Date(`1970-01-01T${times[i]}`);
        const outTime = new Date(`1970-01-01T${times[i + 1]}`);
        totalDuration += (outTime - inTime) / (1000 * 60 * 60); // Convert milliseconds to hours
    }

    return totalDuration; // Total duration in hours
};

// Helper function to check if a punch-in is late (after shift start time)
const isLate = (firstPunchTime, shiftStartTime) => {
    const punchInTime = new Date(`1970-01-01T${firstPunchTime}`);
    const shiftStart = new Date(`1970-01-01T${shiftStartTime}`);
    return punchInTime > shiftStart;
};

const calculateAttendance = (punches, holidays, shiftTotalHours, shiftStartTime, buffTime) => {
    let presentDays = 0;
    let absentDays = 0;
    let totalWorkingDays = 0;
    let adjustedBuffTime = buffTime; // Initialize adjusted buffer time

    const halfDayThreshold = shiftTotalHours / 2;

    punches.forEach(punch => {
        const date = punch.date;

        // Only count days that are neither holidays nor Sundays
        if (!isHolidayOrSunday(date, holidays)) {
            totalWorkingDays++;

            const hasPunchIn = Object.keys(punch.time).length > 0;

            if (hasPunchIn) {
                const punchDuration = calculatePunchDuration(punch.time);
                const firstPunchIn = Object.keys(punch.time).find(time => punch.time[time] === 'in');

                if (firstPunchIn && isLate(firstPunchIn, shiftStartTime)) {
                    // If employee is late, check buffer time
                    if (adjustedBuffTime > 0) {
                        // Use buffer time if available and count full day
                        adjustedBuffTime -= 1; // Deduct buffer by 1 unit (or adjust based on logic)
                        presentDays++;
                    } else if (punchDuration >= shiftTotalHours) {
                        // Full day if punch duration is equal or greater than shift hours
                        presentDays++;
                    } else if (punchDuration >= halfDayThreshold) {
                        presentDays += 0.5;
                        absentDays += 0.5;
                    } else {
                        absentDays++;
                    }
                } else if (punchDuration >= shiftTotalHours) {
                    // Full day if punch duration is equal or greater than shift hours
                    presentDays++;
                } else if (punchDuration >= halfDayThreshold) {
                    presentDays += 0.5;
                    absentDays += 0.5;
                } else {
                    absentDays++;
                }
            } else {
                // No punch data, mark as absent
                absentDays++;
            }
        }
    });

    const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

    return { presentDays, absentDays, attendancePercentage, adjustedBuffTime };
};

// Helper function to check if a given date is a holiday or a Sunday
const isHolidayOrSunday = (date, holidays) => {
    const day = new Date(date.split('-').reverse().join('-')).getDay(); // Parsing date
    return holidays.includes(date) || day === 0; // Sunday is 0
};

const homeInfo = async (req, res) => {
    const { bio_id, campus, category, year, month } = req.body;

    // Input validation
    if (!bio_id || !campus || !category || !year || !month) {
        return res.status(400).json({ status: false, message: "All fields are required" });
    }

    try {
        // Fetch punch and employee details in parallel
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bio_id, year, month),
            empDetailsData(campus, bio_id)
        ]);

        let punchResultData = [];
        let empDetailsResultData = {};
        let shiftResultsData = {};
        let buffResultsData = 0;
        let holidayResultdata = [];

        if (punchResult && punchResult.status) {
            punchResultData = punchResult.data;
        }

        if (empDetailsResult && empDetailsResult.status) {
            empDetailsResultData = empDetailsResult.empDetails;
        }

        const [buffResult, holidayResult] = await Promise.all([
            buffData(campus, category),
            holiday(campus)
        ]);

        if (holidayResult && holidayResult.status) {
            holidayResultdata = holidayResult.data.map(h => new Date(h).toISOString().split('T')[0]);
        }

        if (buffResult && buffResult.status) {
            buffResultsData = buffResult.bufferTimeData || 0;
        }

        if (empDetailsResultData.shift) {
            const shiftResult = await shiftData(empDetailsResultData.shift);
            if (shiftResult && shiftResult.status) {
                shiftResultsData = shiftResult.data;
            }
        }

        const shiftTotalHours = shiftResultsData.total_hrs || 7;
        const shiftStartTime = shiftResultsData.start_time || '08:00:00';

        const { presentDays, absentDays, attendancePercentage, adjustedBuffTime } = calculateAttendance(
            punchResultData, 
            holidayResultdata, 
            shiftTotalHours, 
            shiftStartTime, 
            buffResultsData
        );

        const balanceBuffTime = buffResultsData - adjustedBuffTime;

        res.json({
            punch: punchResultData,
            empDetails: empDetailsResultData,
            shift: shiftResultsData,
            basicBuff: buffResultsData,
            adjustedBuff: adjustedBuffTime,
            balanceBuff: balanceBuffTime,
            holidays: holidayResultdata,
            attendancePercentage,
            presentDays,
            absentDays
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

module.exports = homeInfo;
