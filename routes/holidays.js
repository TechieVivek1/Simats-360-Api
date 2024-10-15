const con = require('../config'); 

async function getHolidaysForCampus(campus) {
    
    return new Promise((resolve, reject) => {
        let query = `SELECT date FROM declared_holidays WHERE campus = ?`;

        con.query(query, [campus], (err, results) => {
            if (err) {
                return reject({ status: false, message: 'Error in database query', error: err });
            }

            if (results.length > 0) {
                const holidays = results.map(row => row.date);
                resolve({ status: true, data: holidays });
            } else {
                resolve({ status: false, message: 'No holidays found for the given campus' });
            }
        });
    });

}

module.exports = getHolidaysForCampus;
