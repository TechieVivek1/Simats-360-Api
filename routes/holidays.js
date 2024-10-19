const con = require('../config'); 

// async function getHolidaysForCampus(campus) {
    
//     return new Promise((resolve, reject) => {
//         let query = `SELECT date FROM declared_holidays WHERE campus = ?`;

//         con.query(query, [campus], (err, results) => {
//             if (err) {
//                 return reject({ status: false, message: 'Error in database query', error: err });
//             }

//             if (results.length > 0) {
//                 const holidays = results.map(row => row.date);
//                 resolve({ status: true, data: holidays });
//             } else {
//                 resolve({ status: false, message: 'No holidays found for the given campus' });
//             }
//         });
//     });

// }

// module.exports = getHolidaysForCampus;


async function getHolidaysForCampus(campus) {
    return new Promise((resolve, reject) => {
        let query = `SELECT date FROM declared_holidays WHERE campus = ?`;

        con.query(query, [campus], (err, results) => {
            if (err) {
                return reject({ status: false, message: 'Error in database query', error: err });
            }

            if (results.length > 0) {
                const holidays = results.map(row => {
                    // Log the raw date fetched from the database
                    console.log("Raw date from database:", row.date);
                    
                    // Create a new Date object from the raw date
                    const utcDate = new Date(row.date);
                    
                    // Log the original UTC date for debugging
                    console.log("Original UTC Date:", utcDate);

                    // Add one day to the date
                    utcDate.setDate(utcDate.getDate() + 1);

                    // Convert the date to the local time zone and then extract the date part (yyyy-MM-dd)
                    const formattedDate = utcDate.toISOString().split('T')[0];

                    // Log the adjusted date for debugging
                    console.log("Adjusted formatted date (after adding one day):", formattedDate);

                    return formattedDate;
                });
                resolve({ status: true, data: holidays });
            } else {
                resolve({ status: false, message: 'No holidays found for the given campus' });
            }
        });
    });
}



module.exports = getHolidaysForCampus;


