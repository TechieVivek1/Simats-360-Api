const con = require('../config');

const getPendingCount = (req, res) => {
    const { bioId } = req.body;

    const pendingCountQuery = `
        SELECT COUNT(*) AS pending_count 
        FROM duty_details 
        WHERE bio_id LIKE ? 
          AND claim_credits = 'No' 
          AND startdate >= DATE_FORMAT(CURDATE(), '%Y-%m-20') 
          AND startdate < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-20'), INTERVAL 1 MONTH) 
        ORDER BY startdate ASC`;

        con.query(pendingCountQuery,[bioId],(err,result)=>{
            if(err) {
                res.status(500).json({status:false,message:`Error Fetching  Pending Count${err.message}`,pendingCount:0});
            }

            if (result.length > 0) {
                res.status(200).json({ status:true,message:"Pending Duty Count Fetched Successfully",pendingCount:result[0].pending_count });  
            } else {

                res.status(200).json({ status:false,message:"No Pending Duty Count",pendingCount:result[0].pending_count });
            }
        })

};


module.exports = getPendingCount