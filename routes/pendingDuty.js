const con = require('../config');

const getPendingCount = (req, res) => {
    const { bioId } = req.body;

    if (!bioId) {
        return res.status(400).json({ message: 'Missing bioId' });
    }

    const pendingDuty = "SELECT id as dutyId,startdate, shift, total_hours, duty_swipe, swipe_details, duty_status FROM duty_details WHERE bio_id = ? and claim_credits = 'No' and exchange_status='Pending'or exchange_status='Rejected' and duty_status = 'Pending' ORDER BY `duty_details`.`startdate` ASC";

        con.query(pendingDuty,[bioId],(err,result)=>{
            if(err) {
                res.status(500).json({status:false,message:`Error Fetching Duty${err.message}`,result});
            }

            if (result.length > 0) {
                res.status(200).json({ status:true,message:"Pending Duty Fetched Successfully",result });  
            } else {

                res.status(200).json({ status:false,message:"No Pending Duty",result });
            }
        })

};


module.exports = getPendingCount