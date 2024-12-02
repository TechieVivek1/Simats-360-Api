const con = require('../config');

const getPendingClaimsCount = (req, res) => {
    const { bioId } = req.body;

    if (!bioId) {
        return res.status(400).json({ message: 'Missing bioId' });
    }

    const pendingCountQuery = `
        SELECT id as dutyId,startdate as startDate FROM duty_details 
        WHERE bio_id = ? 
        AND claim_credits = 'No'
        and exchange_status != 'Approved' 
        And duty_status = 'Completed'`;

        var filteredResult = [];

        con.query(pendingCountQuery,[bioId],(err,result)=>{
            if(err) {
                res.status(500).json({status:false,message:`Error Fetching  Pending claims Count ${err.message}`,claimsData: filteredResult});
            }

            if (result.length > 0) {
                
                filteredResult = result.map((item) => {
                    const date = new Date(item.startDate);
                    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .split('T')[0]; 
                    return {
                        startDate: localDate,
                        dutyId: item.dutyId
                    };
                });
                

                res.status(200).json({ status:true,message:"Pending Duty Claims Count Fetched Successfully",claimsData: filteredResult});  
            } else {
                res.status(200).json({ status:false,message:"No Pending Duty Claims Count",claimsData: filteredResult });
            }
        })

};


module.exports = getPendingClaimsCount