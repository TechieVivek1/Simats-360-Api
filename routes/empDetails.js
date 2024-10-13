const con = require('../config');

async function empDetails(campus, bio_id) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM employee_details WHERE campus = ? AND bio_id = ?`;

        con.query(query, [campus, bio_id], (err, results) => {
            if (err) {
                return reject({ status: false, message: 'Error in database query', error: err });
            }

            if (results.length > 0) {
                resolve({ status: true, empDetails: results[0] });
            } else {
                resolve({ status: false, message: 'No record found for the given campus and bio_id' });
            }
        });
    });
}

module.exports = empDetails;
