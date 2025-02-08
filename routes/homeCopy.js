const con = require("../config");
const punchData = require('./updated_punch');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift');
const buffData = require('./bufferTime');
const holiday = require('./holidays');

// Helper function to calculate the total punch-in time for a given day
// const calculatePunchDuration = (punchTimes) => {
//     const times = Object.keys(punchTimes).sort(); // Sort the times
//     let totalDuration = 0;

//     for (let i = 0; i < times.length - 1; i += 2) {
//         const inTime = new Date(`1970-01-01T${times[i]}`);
//         const outTime = new Date(`1970-01-01T${times[i + 1]}`);
//         totalDuration += (outTime - inTime) / (1000 * 60 * 60); // Convert milliseconds to hours
//     }

//     return totalDuration; // Total duration in hours
// };

// Helper function to check if a punch-in is late (after shift start time)
// const isLate = (firstPunchTime, shiftStartTime) => {
//     const punchInTime = new Date(`1970-01-01T${firstPunchTime}`);
//     const shiftStart = new Date(`1970-01-01T${shiftStartTime}`);
//     return punchInTime > shiftStart;
// };

// const isEarly =  (punchout, shiftEndTime) => {
//     const punchoutTime = new Date(`1970-01-01T${punchout}`);
//     const shiftEnd = new Date(`1970-01-01T${shiftEndTime}`);
//     return punchoutTime < shiftEnd;
// }

// Helper function to check if a given date is a holiday or a Sunday
// const isHolidayOrSunday = (date, holidays) => {
//     const day = new Date(date.split('-').reverse().join('-')).getDay(); // Parsing date
//     return holidays.includes(date) || day === 0; // Sunday is 0
// };

// const calculateAttendance = (punches, holidays, shiftTotalHours, shiftStartTime, buffTime) => {
//     let presentDays = 0;
//     let absentDays = 0;
//     let totalWorkingDays = 0;
//     let adjustedBuffTime = buffTime; // Initialize adjusted buffer time

//     const halfDayThreshold = shiftTotalHours / 2;

//     punches.forEach(punch => {
//         const date = punch.date;

//         // Only count days that are neither holidays nor Sundays
//         if (!isHolidayOrSunday(date, holidays)) {

//             // console.log(holidays);
            
//             totalWorkingDays++;

//             const hasPunchIn = Object.keys(punch.time).length > 0;

//             if (hasPunchIn) {
//                 const punchDuration = calculatePunchDuration(punch.time);
//                 const firstPunchIn = Object.keys(punch.time).find(time => punch.time[time] === 'in');

//                 if (firstPunchIn && isLate(firstPunchIn, shiftStartTime)) {
//                     // If employee is late, check buffer time
//                     if (adjustedBuffTime > 0) {
//                         // Use buffer time if available and count full day
//                         adjustedBuffTime -= 1; // Deduct buffer by 1 unit (or adjust based on logic)
//                         presentDays++;
//                     } else if (punchDuration >= shiftTotalHours) {
//                         // Full day if punch duration is equal or greater than shift hours
//                         presentDays++;
//                     } else if (punchDuration >= halfDayThreshold) {
//                         presentDays += 0.5;
//                         absentDays += 0.5;
//                     } else {
//                         absentDays++;
//                     }
//                 } else if (punchDuration >= shiftTotalHours) {
//                     // Full day if punch duration is equal or greater than shift hours
//                     presentDays++;
//                 } else if (punchDuration >= halfDayThreshold) {
//                     presentDays += 0.5;
//                     absentDays += 0.5;
//                 } else {
//                     absentDays++;
//                 }
//             } else {
//                 // No punch data, mark as absent
//                 absentDays++;
//             }
//         }
//     });

//     const attendancePercentage = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;

//     return { presentDays, absentDays, attendancePercentage, adjustedBuffTime };
// };



const isHolidayOrSundayC = (date, holidays) => {
    const reversedDate = date.split('-').reverse().join('-').trim();

    const day = new Date(reversedDate).getDay(); // Sunday is 0

    const isHoliday = holidays.map(h => h.trim()).includes(reversedDate);

    const isSunday = day === 0;
    
    return isHoliday || isSunday;
};


async function calculateAttendanceC(punchResultData, holidayResultdata, shiftTotalHours, shiftStartTime,shiftEndtime, buffResultsData){

    let presentDays = 0;
    let absentDays = 0;
    let weekoffDays = 0;
    let totalHalfWorkingDays = 0
    let totalWorkingHours = 0;
    let adjustedBuffTime = buffResultsData;
    let gsonData = []
    let attendancePercentage = 0;
    let inTime  = 0;
    let outTime = 0;
    let totalWorkingDays = 0;

    const punch = punchResultData
    const holidays = holidayResultdata

    // console.log(punchResultData, holidayResultdata, shiftTotalHours, shiftStartTime,shiftEndtime, buffResultsData);
    
    // holidayResultdata

    
    
    punch.forEach(punch=>{
        const punchDate = punch.date;


        // console.log(punchDate);
        

        if (!isHolidayOrSundayC(punchDate,holidays)) {

            // console.log("Working day")
            totalWorkingDays++
            const hasPunchIn = Object.keys(punch.time).length > 0;
            // console.log(hasPunchIn);
            
            if (hasPunchIn) {
                if(Object.keys(punch.time).length > 2){
                    let times = Object.keys(punch.time);


                    // New condition 
                    // if (!isset($dailyAttendance[$date])) {
                    //     $dailyAttendance[$date] = [];
                    // }
                    // if (!isset($dailyAttendance[$date]['in_time'])) {
                    //     $dailyAttendance[$date]['in_time'] = $time;
                    // } elseif (isset($dailyAttendance[$date]['in_time']) && !isset($dailyAttendance[$date]['out_time'])) {
                    //     $inTime = strtotime($dailyAttendance[$date]['in_time']);
                    //     $currentTime = strtotime($time);
                    //     $timeDifference = ($currentTime - $inTime) / 60;
                    //     if ($timeDifference > 120) {
                    //         $dailyAttendance[$date]['out_time'] = $time;
                    //     }
                    // }
                    

                    let firstTime = times[0]; 
                    let lastTime = times[times.length - 1];

                    //  console.log(firstTime,lastTime);


                    // console.log(firstTime,lastTime);
                    
                     
                    let firstTimeDate = new Date(`1970-01-01T${firstTime}Z`);
                    let lastTimeDate = new Date(`1970-01-01T${lastTime}Z`);

                    

                    let shiftStartDate = new Date(`1970-01-01T${shiftStartTime}Z`);
                    let shiftEndDate = new Date(`1970-01-01T${shiftEndtime}Z`);
                    let durationMs = lastTimeDate - firstTimeDate; 

                    // console.log(shiftStartDate,shiftEndDate,durationMs);
                    

                    let hours = Math.floor(durationMs / (1000 * 60 * 60)); // Convert ms to hours
                    let minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    let totalWorkingHoursDuration =  hours + (minutes / 60);

                    // console.log("totalworkinghours"+ totalWorkingHoursDuration);
                    

                    if(firstTimeDate  > shiftStartDate){
                        console.log("firstTimeDate > shiftStartDate" +"late");
                        let  late = firstTimeDate - shiftStartDate;
                        let lateHours = Math.floor(late / (1000 * 60 * 60));
                        let lateMinutes = Math.floor((late % (1000 * 60 * 60))/ (1000 * 60));

                        inTime = lateHours +  (lateMinutes / 60);


                        console.log("late minutes"+inTime);
                        if(inTime>0){
                            adjustedBuffTime = adjustedBuffTime - inTime
                        }  
                        
                    }
                    if(lastTimeDate < shiftEndDate){
                        let  late = shiftEndDate - lastTimeDate;
                        let lateHours = Math.floor(late / (1000 * 60 * 60));
                        let lateMinutes = Math.floor((late % (1000 * 60 * 60))/ (1000 * 60));
                        outTime = lateHours +  (lateMinutes / 60);

                        if(outTime>0){
                            adjustedBuffTime = adjustedBuffTime - outTime
                        }
                        
                    }


                    if(adjustedBuffTime  < 0){
                        let  exceededMinutes = Math.abs(adjustedBuffTime);
                        if(exceededMinutes < 30){
                            absentDays = 0;
                        } else if(exceededMinutes < 60){
                            absentDays = 0.5;
                        } else {
                            absentDays = 0.5 + Math.floor((exceededMinutes - 30) /  30) * 0.5;
                        }
                    }

                    if(totalWorkingHoursDuration  >= 4.00) {
                        presentDays ++;
                        totalWorkingHours += totalWorkingHoursDuration;
                    } else if( totalWorkingHoursDuration > 0) {
                        totalHalfWorkingDays ++;
                        totalWorkingHours += totalWorkingHoursDuration;
                    } 

                    gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"present"})
                    inTime = 0
                    outTime = 0

                    

                } else {
                    totalWorkingDays ++
                    totalHalfWorkingDays++

                    if(Object.keys(punch.time).length > 1){
                        let times =  Object.keys(punch.time)
                        let singlePunch = times[0];
                    }
                    gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"halfday present"})
                }
            } else{
                totalWorkingDays++
                absentDays++
                gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"absent"})
            } 
        } else {
            // console.log("holiday")
            const hasPunchIn = Object.keys(punch.time).length > 0;
            if (hasPunchIn) {
                totalWorkingDays++
                // totalHalfWorkingDays++

                if(Object.keys(punch.time).length > 2){
                    let times = Object.keys(punch.time);

                    let firstTime = times[0]; 
                    let lastTime = times[times.length - 1];

                     
                    let firstTimeDate = new Date(`1970-01-01T${firstTime}Z`);
                    let lastTimeDate = new Date(`1970-01-01T${lastTime}Z`);

                    let shiftStartDate = new Date(`1970-01-01T${shiftStartTime}Z`);
                    let shiftEndDate = new Date(`1970-01-01T${shiftEndtime}Z`);
                    let durationMs = lastTimeDate - firstTimeDate; 

                    let hours = Math.floor(durationMs / (1000 * 60 * 60)); // Convert ms to hours
                    let minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    let totalWorkingHoursDuration =  hours + (minutes / 60);


                    if(firstTimeDate  > shiftStartDate){
                        let  late = firstTimeDate - shiftStartDate;
                        let lateHours = Math.floor(late / (1000 * 60 * 60));
                        let lateMinutes = Math.floor((late % (1000 * 60 * 60))/ (1000 * 60));
                        inTime = lateHours +  (lateMinutes / 60);

                        if(inTime>0){
                            adjustedBuffTime = adjustedBuffTime - inTime
                        }
                        
                    }
                    if(lastTimeDate< shiftEndDate){
                         let  late = shiftEndDate - lastTimeDate;
                        let lateHours = Math.floor(late / (1000 * 60 * 60));
                        let lateMinutes = Math.floor((late % (1000 * 60 * 60))/ (1000 * 60));
                        outTime = lateHours +  (lateMinutes / 60);
                        if(outTime>0){
                            adjustedBuffTime = adjustedBuffTime - outTime
                        }
                    }


                    if(adjustedBuffTime  < 0){
                        let  exceededMinutes = Math.abs(adjustedBuffTime);
                        if(exceededMinutes < 30){
                            absentDays = 0;
                        } else if(exceededMinutes < 60){
                            absentDays = 0.5;
                        } else {
                            absentDays = 0.5 + Math.floor((exceededMinutes - 30) /  30) * 0.5;
                        }
                    }

                    if(totalWorkingHoursDuration  >= 4.00) {
                        presentDays ++;
                        totalWorkingHours += totalWorkingHoursDuration;
                    } else if( totalWorkingHoursDuration > 0) {
                        totalHalfWorkingDays ++;
                        totalWorkingHours += totalWorkingHoursDuration;
                    } 
                    gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"week off && present"})
                    inTime = 0
                    outTime = 0

                } else {
                    totalHalfWorkingDays++
                    gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"pending"})
                }
            } else{
                weekoffDays++
                gsonData.push({date :punchDate,remainingBuff:adjustedBuffTime,exceed:inTime,early:outTime,status:"week off"})
            }

        }
    })

    console.log("presentDays:" + presentDays + "absentDays:" + absentDays);
    


    // console.log("percentage:" +attendancePercentage);
    // console.log("totalWorkingDays:" + totalWorkingDays);
    

    // console.log("holidays" +holidays);

    attendancePercentage =  (presentDays + totalHalfWorkingDays/2) / totalWorkingDays * 100

    let totalPresent = presentDays  + totalHalfWorkingDays/2



    return {totalWorkingDays,totalPresent,presentDays,absentDays,totalHalfWorkingDays,weekoffDays,totalWorkingHours,adjustedBuffTime,gsonData,attendancePercentage}

}

const db = require('../config'); // Import database connection
const moment = require('moment'); // Import moment.js for date formatting

const updateAttendance = async (req, res) => {
    try {
        const { bioId, campus, cl, sl, el } = req.body;

        if (!bioId) {
            return res.status(400).json({ status: false, message: "bioId is required" });
        }

        if (!campus) {
            return res.status(400).json({ status: false, message: "campus is required" });
        }

        if (cl === undefined || sl === undefined || el === undefined) {
            return res.status(400).json({ status: false, message: "cl,sl and el are required" });
        }

        // First, fetch the current 'updated_at' from the database
        const fetchQuery = `SELECT updated_at FROM available_leave WHERE bio_id = ? AND campus = ?`;

        db.query(fetchQuery, [bioId, campus], (err, result) => {
            if (err) {
                console.error("Error fetching updated_at:", err);
                return res.status(500).json({ status: false, message: "Internal server error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ status: false, message: "Leave record not found" });
            }

            // Extract the 'updated_at' field from the result
            const updatedAt = result[0].updated_at;

            // Format the 'updated_at' to the required format (YYYY-MM-DD HH:MM:SS)
            const formattedUpdatedAt = moment(updatedAt).format('YYYY-MM-DD HH:mm:ss');

            // Now, update the leave limits and use the formatted 'updated_at' value
            const updateQuery = `
                UPDATE available_leave
                SET casual_leave_limit = casual_leave_limit + ?, 
                sick_leave_limit = sick_leave_limit + ?, earned_leave_limit = earned_leave_limit + ? ,updated_at = ?
                WHERE bio_id = ? AND campus = ? ;
            `;

            db.query(updateQuery, [cl, sl, el,formattedUpdatedAt, bioId, campus], (err, result) => {
                if (err) {
                    console.error("Error updating leave limits:", err);
                    return res.status(500).json({ status: false, message: "Internal server error" });
                }
                
                if (result.affectedRows === 0) {
                    return res.status(404).json({ status: false, message: "Leave record not found" });
                }

                // Send back the response with the formatted 'updated_at'
                return res.status(200).json({
                    status: true,
                    message: "Leave limits updated successfully",
                    updated_at: formattedUpdatedAt // Include the formatted 'updated_at' in the response
                });
            });
        });
    } catch (error) {
        console.log("Error updating leave limits:", error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
};




const homeInfo = async (req, res) => {
    const { bioId, campus, category, year, month } = req.body;

    // Input validation
    if (!bioId || !campus || !category || !year || !month) {
        return res.status(400).json({ status: false, message: "All fields are required" , error:"All fields are required" });

    }

    let revisedMonth = month - 1

    try {
        // Fetch punch and employee details in parallel
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bioId, year, revisedMonth),
            empDetailsData(campus, bioId)
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
        const shiftEndtime = shiftResultsData.end_time ||  '17:00:00';


        // const { presentDays, absentDays, attendancePercentage, adjustedBuffTime } = calculateAttendance(
        //     punchResultData, 
        //     holidayResultdata, 
        //     shiftTotalHours, 
        //     shiftStartTime,
        //     shiftEndtime, 
        //     buffResultsData
        // );


    
        const {totalWorkingDays,totalPresent,presentDays,absentDays,totalHalfWorkingDays,weekoffDays,totalWorkingHours,adjustedBuffTime,gsonData,attendancePercentage} = await calculateAttendanceC(
            punchResultData, holidayResultdata, shiftTotalHours, shiftStartTime,shiftEndtime, buffResultsData
        );

        // const balanceBuffTime = buffResultsData - adjustedBuffTime;

        res.status(200).json({status:true,message:"Home Data Fetched",data:[{totalWorkingDays,totalPresent,presentDays,absentDays,totalHalfWorkingDays,weekoffDays,totalWorkingHours,adjustedBuffTime,attendancePercentage
        // ,gsonData
        }]})

    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

module.exports = {homeInfo,updateAttendance};
