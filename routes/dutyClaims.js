const db = require('../config');

const dutyClaims = (req, res) => {
    const { campus, bioId, dutyDate, creditName ,dutyId} = req.body;

    if (!campus || !bioId || !dutyDate || !creditName || !dutyId) {
        return res.status(400).json({
            status: false,
            message: "Missing required fields"
        });
    }

    const checkDuplicateQuery = 'SELECT * FROM duty_credits_history WHERE bio_id = ? AND duty_date = ?';
    db.query(checkDuplicateQuery, [bioId, dutyDate], (err, results) => {
        if (err) {
    
            return res.status(500).json({
                status: false,
                message: "Internal server Error",
                isClaimed: false,
            });
        }

        if (results.length > 0) {
            return res.status(409).json({
                status: false,
                message: "Duty already claimed.",
                isClaimed: false,
            });
        }

        const insertQuery = 'INSERT INTO duty_credits_history (campus, bio_id, duty_date, credit_name) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [campus, bioId, dutyDate, creditName], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Internal server Error",
                    isClaimed: false,
                });
            }

            if (result.affectedRows > 0) {
                
                if (creditName == "CL") {
                    const updateQuery = 'UPDATE available_leave SET casual_leave_limit = casual_leave_limit + 1 WHERE bio_id = ? AND campus = ?';
                    db.query(updateQuery, [bioId, campus], (err, updateResult) => {
                        if (err) {
                            return res.status(500).json({
                                status: false,
                                message: "Internal server Error while updating casual leave limit.",
                                isClaimed: false, 
                            });
                        }
    
                        const updateDutyDetaisQuery = 'update duty_details set claim_credits = "Yes" where id = ?';
    
                        db.query(updateDutyDetaisQuery,[dutyId],(err,updateDutyResult)=>{
                            if(err){
                                return res.status(500).json({ 
                                    status:false,
                                    message:"Internal server Error while updating duty details.",
                                    isClaimed:false 
                                })
                            }
    
                            return res.status(201).json({
                                status: true,
                                message: "casual leave credited successfully.",
                                isClaimed: true,
                            });
                        
                        })
    
                       
                    });
                } else {
                    const updateDutyDetaisQuery = 'update duty_details set claim_credits = "Yes" where id = ?';
    
                    db.query(updateDutyDetaisQuery,[dutyId],(err,updateDutyResult)=>{
                        if(err){
                            return res.status(500).json({ 
                                status:false,
                                message:"Internal server Error while updating duty details.",
                                isClaimed:false 
                            })
                        }

                        return res.status(201).json({
                            status: true,
                            message: "Enchashment successfully claimed",
                            isClaimed: true,
                        });
                    
                    })
                }

               
            } else {

                return res.status(500).json({
                    status: false,
                    message: "Failed to record the duty claim.",
                    isClaimed: false,
                });
            }
        });
    });
};

module.exports = dutyClaims;
