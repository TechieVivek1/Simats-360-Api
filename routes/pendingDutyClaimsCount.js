const con = require('../config');

const getPendingClaimsCount = (req, res) => {
    const { bioId } = req.body;

    if (!bioId) {
        return res.status(400).json({ message: 'Missing bioId' });
    }

    const pendingCountQuery = `
        SELECT startdate FROM duty_details 
        WHERE bio_id LIKE ? 
          AND claim_credits = 'No' 
          AND startdate >= DATE_FORMAT(CURDATE(), '%Y-%m-20') 
          AND startdate < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-20'), INTERVAL 1 MONTH) 
        ORDER BY startdate ASC`;

        con.query(pendingCountQuery,[bioId],(err,result)=>{
            if(err) {
                res.status(500).json({status:false,message:`Error Fetching  Pending Count${err.message}`,claimsData: result});
            }

            if (result.length > 0) {
                res.status(200).json({ status:true,message:"Pending Duty Count Fetched Successfully",claimsData: result});  
            } else {
                res.status(200).json({ status:false,message:"No Pending Duty Count",claimsData: result });
            }
        })

};


module.exports = getPendingClaimsCount