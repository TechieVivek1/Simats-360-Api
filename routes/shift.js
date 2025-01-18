const con =  require('../config');

async function getShiftTimes(shiftName) {
    
    return new Promise((resolve, reject) => {
        let query = `SELECT start_time, end_time,total_hrs,duty_swipe FROM shift WHERE shift_name = ?`;

        con.query(query, [shiftName], (err, results) => {
            if (err) {
                return reject({ status: false, message: 'Error in database query', error: err });
            }

            if (results.length > 0) {
                resolve({ status: true, data: results[0] });
            } else {
                resolve({ status: false, message: 'No record found for the given shiftName' });
            }
        });
    });
    

  }

  module.exports = getShiftTimes
  