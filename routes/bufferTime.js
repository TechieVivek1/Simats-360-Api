
const db = require('../config');

const bufferTime = (campus, category) => {
    const query = 'SELECT assigned_buff_time FROM category_buff_time WHERE campus = ? AND category = ?'

    db.query(query,[campus,category],(err,result) => {
        if (err) {
            return {status:false,message: 'Error in database query',error:err}
        }

        if (result.length > 0) {
            let data = result.map(row => ({
                bufferTime: row.assigned_buff_time
            }))
            return {status:true,message:"Data Fetched Succesfully",bufferTimeData: data}
        } else {
            return {status:false,message: 'No Data found in Database'}
        }
    })
}

module.exports = bufferTime