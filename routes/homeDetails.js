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

// Helper function to calculate attendance and adjust buffer
const calculateAttendance = (punches, holidays, shiftTotalHours, bufferTime) => {
    let presentDays = 0;
    let absentDays = 0;
    let totalWorkingDays = 0; // Only count non-holiday, non-Sunday days
    let adjustedBuffTime = bufferTime; // Start with the basic buffer time

    const halfDayThreshold = shiftTotalHours / 2; // Half-day threshold

    punches.forEach(punch => {
        const date = punch.date;

        // Only count days that are not holidays or Sundays
        if (!isHolidayOrSunday(date, holidays)) {
            totalWorkingDays++; // Increment total working days

            const punchTimes = Object.keys(punch.time);
            const hasPunchIn = punchTimes.length > 0; // Check if punches exist

            if (hasPunchIn) {
                const punchDuration = calculatePunchDuration(punch.time);

                if (punchDuration >= shiftTotalHours) {
                    // Full day: If the total punch duration equals or exceeds the shift hours
                    presentDays++;
                    // Deduct buffer for late arrival/early exit
                    if (punchTimes.length >= 2) {
                        const firstPunch = new Date(`1970-01-01T${punchTimes[0]}`);
                        const shiftStartTime = new Date(`1970-01-01T08:00:00`); // Assuming shift starts at 08:00:00
                        if (firstPunch > shiftStartTime) {
                            const lateMinutes = (firstPunch - shiftStartTime) / (1000 * 60); // Convert to minutes
                            adjustedBuffTime -= lateMinutes; // Deduct buffer for being late
                        }
                    }
                } else if (punchDuration >= halfDayThreshold) {
                    // Half day: Between half-day threshold and full-day hours
                    presentDays += 0.5;
                    absentDays += 0.5; // Half-day absent
                    // Adjust buffer accordingly
                    const remainingHalfDayHours = halfDayThreshold - punchDuration; // Hours not worked
                    const remainingHalfDayMinutes = remainingHalfDayHours * 60; // Convert to minutes
                    adjustedBuffTime -= remainingHalfDayMinutes; // Deduct from buffer
                } else {
                    // Less than half-day hours is considered full absent
                    absentDays++;
                }
            } else {
                // No punches at all, count as absent
                absentDays++;
            }
        }
    });

    // Calculate attendance percentage
    const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

    return { presentDays, absentDays, attendancePercentage, adjustedBuffTime };
};

// Helper function to check if a given date is a holiday or a Sunday
const isHolidayOrSunday = (date, holidays) => {
    const day = new Date(date.split('-').reverse().join('-')).getDay(); // Parsing date
    return holidays.includes(date) || day === 0; // Sunday is 0
};

// Helper function to calculate the date range from the 21st of the previous month to the 20th of the current month
const getCurrentDateRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-based index for months

    // Define the 21st of the previous month
    const startDate = new Date(currentYear, currentMonth - 1, 21);

    // Define the 20th of the current month
    const endDate = new Date(currentYear, currentMonth, 20);

    return { startDate, endDate, currentMonth };
};

// Main function to handle attendance and punch data calculation
const homeInfo = async (req, res) => {
    const { bio_id, campus, category } = req.body;

    // Input validation
    if (!bio_id || !campus || !category) {
        return res.status(400).json({ status: false, message: "bio_id, campus, and category are required" });
    }

    // Set the year to 2024 and calculate the current month and date range
    const year = 2024;
    const { startDate, endDate, currentMonth } = getCurrentDateRange();

    try {
        // Fetch punch and employee details in parallel
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bio_id, year, currentMonth), // Pass year as 2024 and month from calculated date range
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

        // Fetch buffer time and holidays
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

        // Fetch shift details if available
        if (empDetailsResultData.shift) {
            const shiftResult = await shiftData(empDetailsResultData.shift);
            if (shiftResult && shiftResult.status) {
                shiftResultsData = shiftResult.data;
            }
        }

        const shiftTotalHours = shiftResultsData.total_hrs || 7; // Default total shift hours

        // Calculate attendance
        const { presentDays, absentDays, attendancePercentage, adjustedBuffTime } = calculateAttendance(
            punchResultData,
            holidayResultdata,
            shiftTotalHours,
            buffResultsData
        );

        const balanceBuffTime = buffResultsData - adjustedBuffTime; // Calculate buffer time balance

        // Return the response with attendance and other details
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
            absentDays // Days considered absent
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

module.exports = homeInfo;
