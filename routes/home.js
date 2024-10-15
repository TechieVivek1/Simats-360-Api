const con = require("../config");
const punchData = require('./punchData');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift');
const buffData = require('./bufferTime');
const holiday = require('./holidays');

const punch_url = process.env.ATTENDANCE_URL;

// Helper function to check if a given date is a holiday or a Sunday
const isHolidayOrSunday = (date, holidays) => {
    const day = new Date(date).getDay();
    return holidays.includes(date) || day === 0; // Sunday is 0
};

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

// Function to calculate present, absent days (LOP), and attendance percentage
const calculateAttendance = (punches, holidays, shiftTotalHours) => {
    let presentDays = 0;
    let absentDays = 0;
    let totalWorkingDays = 0;  // Only count the non-holiday, non-Sunday days

    const halfDayThreshold = shiftTotalHours / 2; // Calculate half-day hours

    punches.forEach(punch => {
        const date = punch.date;

        // Only count days that are neither holidays nor Sundays
        if (!isHolidayOrSunday(date, holidays)) {
            totalWorkingDays++;  // Increment the total working days count

            const hasPunchIn = Object.keys(punch.time).length > 0; // Check if there are any punch times

            if (hasPunchIn) {
                const punchDuration = calculatePunchDuration(punch.time);

                if (punchDuration >= shiftTotalHours) {
                    // Full day if the total punch duration is greater than or equal to the shift hours
                    presentDays++;
                } else if (punchDuration >= halfDayThreshold) {
                    // Count as half-day if the punch duration is between half-day and full-day hours
                    presentDays += 0.5;
                    absentDays += 0.5; // Half-day absence
                } else {
                    // Count as full absent if the punch duration is less than half-day hours
                    absentDays++;
                }
            } else {
                // If no punch, it's considered absent (LOP)
                absentDays++;
            }
        }
    });

    // Calculate attendance percentage based on total working days
    const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

    return { presentDays, absentDays, attendancePercentage };
};

// Main function for calculating and returning attendance and employee details
const homeInfo = async (req, res) => {
    const { bio_id, campus, category, year, month } = req.body;

    // Input validation
    if (!bio_id) {
        return res.status(400).json({ status: false, message: "bio_id is required" });
    }
    if (!campus) {
        return res.status(400).json({ status: false, message: "campus is required" });
    }
    if (!category) {
        return res.status(400).json({ status: false, message: "category is required" });
    }
    if (!year) {
        return res.status(400).json({ status: false, message: "year is required" });
    }
    if (!month) {
        return res.status(400).json({ status: false, message: "month is required" });
    }

    try {
        // Fetching punch and employee details in parallel
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bio_id, year, month),
            empDetailsData(campus, bio_id)
        ]);

        let punchResultData = [];
        let empDetailsResultData = {};
        let shiftResultsData = [];
        let buffResultsData = [];
        let holidayResultdata = [];

        if (punchResult && punchResult.status) {
            punchResultData = punchResult.data;
        }

        if (empDetailsResult && empDetailsResult.status) {
            empDetailsResultData = empDetailsResult.empDetails;
        }

        // Fetching buffer time and holidays
        const buffResult = await buffData(campus, category);
        const holidayResult = await holiday(campus);

        if (holidayResult && holidayResult.status) {
            holidayResultdata = holidayResult.data.map(h => new Date(h).toISOString().split('T')[0]); // Format holidays
        }

        if (buffResult && buffResult.status) {
            buffResultsData = buffResult.bufferTimeData; // Assuming this is the basic buffer time
        }

        // Fetch shift details if available
        if (empDetailsResultData.shift) {
            const shiftResult = await shiftData(empDetailsResultData.shift);

            if (shiftResult && shiftResult.status) {
                shiftResultsData = shiftResult.data;
            }
        }

        // Get total shift hours from shift data (assuming it's available)
        const shiftTotalHours = shiftResultsData.total_hrs || 8; 

        // Calculate attendance
        const { presentDays, absentDays, attendancePercentage } = calculateAttendance(punchResultData, holidayResultdata, shiftTotalHours);

        // Adjust basic buffer time based on attendance
        let adjustedBuffTime = buffResultsData; // Start with the basic buffer time

        // For each punch entry, reduce the buffer time based on punch times
        punchResultData.forEach(punch => {
            const times = Object.keys(punch.time);
            if (times.length > 0) {
                const firstPunchIn = times.find(time => punch.time[time] === 'in');
                if (firstPunchIn) {
                    adjustedBuffTime -= shiftTotalHours; // Reduce full hours for each punch in
                }
            }
        });

        // Calculate the balance buffer time
        const balanceBuffTime = buffResultsData - adjustedBuffTime;

        // Return the response with attendance and other details
        res.json({
            // punch: punchResultData,
            // empDetails: empDetailsResultData,
            // shift: shiftResultsData,
            basicBuff: buffResultsData,
            adjustedBuff: adjustedBuffTime,
            balanceBuff: balanceBuffTime,
            // holidays: holidayResultdata,
            attendancePercentage,
            presentDays,
            absentDays // LOP: days considered absent
        });

    } catch (error) {
        // Error handling
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

module.exports = homeInfo;
