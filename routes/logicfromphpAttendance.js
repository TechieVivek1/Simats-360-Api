const axios = require('axios');
const db = require('../config');

const attendanceRevised = (req, res) => {
  const { bio_id, campus, category, year, month } = req.body;

  if (!bio_id || !campus || !category || !year || !month) {
    return res.status(400).json({ message: 'Invalid fields data' });
  }

  // Fetch shift details
  const shiftQuery = "SELECT shift FROM employee_details WHERE campus = ? AND bio_id = ?";
  db.query(shiftQuery, [campus, bio_id], (err, shiftResult) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (shiftResult.length === 0) return res.status(404).json({ message: 'Shift not found' });

    const employeeShift = shiftResult[0].shift;

    // Fetch buffer time
    const bufferQuery = "SELECT assigned_buff_time FROM category_buff_time WHERE campus = ? AND category = ?";
    db.query(bufferQuery, [campus, category], (err, bufferResult) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      const initialBufferTime = bufferResult.length > 0 ? bufferResult[0].assigned_buff_time : 750;
      let remainingBufferTime = initialBufferTime;

      // Set up the start and end date: 21st of previous month to 20th of the given month
      const startDate = new Date(year, month - 1, 21); // 21st of the previous month
      const endDate = new Date(year, month, 20); // 20th of the given month
      const today = new Date();

      // Make sure the end date is not in the future
      if (endDate > today) {
        endDate.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      }

      // Fetch attendance data from external API
      const url = `http://180.235.121.247/attendance_log.php?UserId=${encodeURIComponent(bio_id)}`;
      
      axios.get(url)
        .then(response => {
          const data = response.data;

          if (!data.attendance) {
            return res.status(404).json({ message: 'No data found for this user' });
          }

          // Process attendance logic
          const processAttendanceData = (attendanceData, employeeShift, initialBufferTime) => {
            let dailyAttendance = {};
            let fullDayCount = 0;
            let halfDayCount = 0;
            let absentCount = 0;
            let weekOffCount = 0;
            let totalWorkingHours = 0;
            let remainingBufferTime = initialBufferTime;

            const period = [];
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              period.push(new Date(d));
            }

            // Fetch holidays from the database
            db.query("SELECT date FROM declared_holidays WHERE campus = ?", [campus], (err, holidayRows) => {
              if (err) return res.status(500).json({ message: 'Database error while fetching holidays' });

              const declaredHolidays = holidayRows.map(row => new Date(row.date).toLocaleDateString('en-GB'));

              attendanceData.attendance.forEach(record => {
                const logDate = new Date(record.LogDate.date);
                const dateStr = logDate.toLocaleDateString('en-GB');

                if (!dailyAttendance[dateStr]) {
                  dailyAttendance[dateStr] = {};
                }

                const time = logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                if (logDate.getHours() < 12) {
                  dailyAttendance[dateStr]['in_time'] = time;
                } else {
                  dailyAttendance[dateStr]['out_time'] = time;
                }
              });

              period.forEach(date => {
                const dateStr = date.toLocaleDateString('en-GB');
                const times = dailyAttendance[dateStr] || {};
                const inTime = times.in_time || 'N/A';
                const outTime = times.out_time || 'N/A';

                const isSunday = date.getDay() === 0; // Sunday
                const isHoliday = declaredHolidays.includes(dateStr);
                let presence = '';
                let durationString = 'N/A';

                if (isSunday) {
                  presence = 'Week Off';
                  weekOffCount++;
                } else if (isHoliday) {
                  presence = 'Holiday';
                } else {
                  if (inTime !== 'N/A' && outTime !== 'N/A') {
                    const inDateTime = new Date(`${dateStr} ${inTime}`);
                    const outDateTime = new Date(`${dateStr} ${outTime}`);
                    const duration = (outDateTime - inDateTime) / (1000 * 60); // duration in minutes
                    const totalDurationInHours = duration / 60;
                    durationString = `${Math.floor(totalDurationInHours)} hours ${duration % 60} minutes`;

                    const shiftStartDateTime = new Date(`${dateStr} ${employeeShift.start_time}`);
                    const shiftEndDateTime = new Date(`${dateStr} ${employeeShift.end_time}`);

                    let lateMinutes = 0;
                    let earlyMinutes = 0;

                    if (inDateTime > shiftStartDateTime) {
                      lateMinutes = Math.round((inDateTime - shiftStartDateTime) / (1000 * 60));
                      remainingBufferTime -= lateMinutes;
                    }

                    if (outDateTime < shiftEndDateTime) {
                      earlyMinutes = Math.round((shiftEndDateTime - outDateTime) / (1000 * 60));
                      remainingBufferTime -= earlyMinutes;
                    }

                    // LOP calculation
                    if (remainingBufferTime < 0) {
                      const exceededMinutes = Math.abs(remainingBufferTime);
                      if (exceededMinutes < 30) {
                        // No LOP
                      } else if (exceededMinutes < 60) {
                        totalWorkingHours += 0.5;
                      } else {
                        totalWorkingHours += 0.5 + Math.floor((exceededMinutes - 30) / 30) * 0.5;
                      }
                    }

                    if (totalDurationInHours >= 4) {
                      presence = 'Present';
                      fullDayCount++;
                    } else {
                      presence = 'Half Day';
                      halfDayCount++;
                    }

                    totalWorkingHours += totalDurationInHours;
                  } else if (inTime !== 'N/A' && outTime === 'N/A') {
                    presence = today.toLocaleDateString('en-GB') === dateStr ? 'Pending' : 'Absent';
                    if (presence === 'Absent') absentCount++;
                  } else {
                    presence = 'Absent';
                    absentCount++;
                  }
                }

                // Prepare attendance response for this date
                // You can store or return this response as needed
              });
          processAttendanceData(data, employeeShift, initialBufferTime);


              // Respond with attendance summary
              res.json({
                fullDays: fullDayCount,
                halfDays: halfDayCount,
                absentDays: absentCount,
                weekOffs: weekOffCount,
                totalWorkingHours: totalWorkingHours.toFixed(2),
                remainingBufferTime: remainingBufferTime,
                declaredHolidays: declaredHolidays.length
              });
            });
          };

          // Calling the function to process attendance data
        })
        .catch(() => {
          res.status(500).json({ message: 'Error fetching attendance data' });
        });
    });
  });
};

module.exports = attendanceRevised;
