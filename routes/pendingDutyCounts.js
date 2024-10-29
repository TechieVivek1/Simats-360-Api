const con = require('../config');

const getPendingDutyCount = (req, res) => {
    const { bioId } = req.body;

    if (!bioId) {
        return res.status(400).json({ message: 'Missing bioId' });
    }

    const pendingCountQuery = `
        SELECT COUNT(*) AS pending_count 
        FROM duty_details where
        bio_id = ? AND claim_credits = 'No' and duty_status = 'Pending'`;

        // SELECT startdate, shift, total_hours, duty_swipe, swipe_details, duty_status FROM duty_details WHERE bio_id = ? AND claim_credits = 'No' and duty_status = 'Pending' ORDER BY `duty_details`.`startdate` ASC"

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


module.exports = getPendingDutyCount