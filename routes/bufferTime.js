const db = require('../config');

const bufferTime = (campus, category) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT assigned_buff_time FROM category_buff_time WHERE campus = ? AND category = ?';

        db.query(query, [campus, category], (err, result) => {
            if (err) {
                return reject({ status: false, message: 'Error in database query', error: err });
            }

            if (result.length > 0) {
                let data = result.map(row => ({
                    bufferTime: row.assigned_buff_time
                }));
                return resolve({ status: true, message: "Data Fetched Successfully", bufferTimeData: data[0].bufferTime });
            } else {
                return resolve({ status: false, message: 'No Data found in Database' });
            }
        });
    });
}



module.exports = bufferTime;
