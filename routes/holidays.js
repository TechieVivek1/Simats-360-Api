const con = require('../config');

async function getHolidaysForCampus(campus) {
    try {
        return new Promise((resolve, reject) => {
            let query = `SELECT date FROM declared_holidays WHERE campus = ?`;

            con.query(query, [campus], (err, results) => {
                if (err) {
                    return reject({ status: false, message: 'Error in database query', error: err });
                }

                if (results.length > 0) {
                    const holidays = results.map(row => {
                        const localDate = new Date(row.date);
                        const formattedDate = localDate.toLocaleDateString('en-CA'); // Format as yyyy-MM-dd
                        return formattedDate;
                    });
                    // console.log(holidays);
                    
                    resolve({ status: true, data: holidays });
                } else {
                    resolve({ status: false, message: 'No holidays found for the given campus' });
                }
            });
        });
    } catch (error) {
        console.error("Unhandled error:", error);
        throw new Error('Error occurred while fetching holidays');
    }
}

module.exports = getHolidaysForCampus;
