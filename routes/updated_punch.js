const express = require('express');
const axios = require('axios');
const moment = require('moment-timezone'); // Ensure you have this package installed

const app = express();
const PORT = 3000; // Change this port as needed

// Helper function to format date as DD-MM-YYYY
function formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

// Helper function to format time in HH:MM:SS
function formatTime(date) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

// Define the API endpoint
app.get('/api/attendance/:bioId', async (req, res) => {
    const { bioId } = req.params;
    const url = `http://180.235.121.247/attendance_log.php?UserId=${bioId}`;

    try {
        // Fetch the attendance data
        const response = await axios.get(url);
        const data = response.data;

        // Check the status
        if (!data.status) {
            return res.status(400).json({ message: data.message });
        }

        const attendanceRecords = data.attendance;

        // Prepare the result object to group by date
        const result = {};

        attendanceRecords.forEach(record => {
            // Parse the log date and convert to local timezone Asia/Kolkata
            const logDate = moment.tz(record.LogDate.date, "Asia/Kolkata");
            const formattedDate = formatDate(logDate.toDate()); // Format date as DD-MM-YYYY

            // Initialize the time object for this date if it doesn't exist
            if (!result[formattedDate]) {
                result[formattedDate] = {
                    date: formattedDate,
                    time: {}
                };
            }

            // Format the time and use as key
            const timeKey = formatTime(logDate.toDate()); // Format time as HH:MM:SS
            
            // Store the status as a single string instead of an array
            result[formattedDate].time[timeKey] = record.C1; // Store status directly as a string
        });

        // Convert result object to an array of objects
        let finalResult = Object.values(result);

        // Sort the records: current date first, then previous dates in descending order
        finalResult.sort((a, b) => {
            // Compare dates in descending order
            return moment(b.date, "DD-MM-YYYY").diff(moment(a.date, "DD-MM-YYYY"));
        });

        // Send the response
        res.json(finalResult);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json({ message: error.response.statusText });
        } else if (error.request) {
            return res.status(500).json({ message: 'No response received from the server.' });
        } else {
            return res.status(500).json({ message: 'Error in setting up the request.' });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
