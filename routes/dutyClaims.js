const db = require('../config');

const dutyClaims = (req, res) => {
    const { campus, bioId, dutyDate, creditName ,dutyId} = req.body;

    // Validate required fields
    if (!campus || !bioId || !dutyDate || !creditName || !dutyId) {
        return res.status(400).json({
            status: false,
            message: "Missing required fields: campus, bioId, dutyDate, dutyId, or creditName"
        });
    }

    // Check for duplicate entry based on bioId and dutyDate
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

            // If the insertion was successful
            if (result.affectedRows > 0) {
                // Update the casual_leave_limit column
                const updateQuery = 'UPDATE available_leave SET casual_leave_limit = casual_leave_limit + 1 WHERE bio_id = ? AND campus = ?';
                db.query(updateQuery, [bioId, campus], (err, updateResult) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: "Internal server Error while updating casual leave limit.",
                            isClaimed: false, // The claim was recorded, but updating failed
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
                            message: "Duty claim recorded successfully and casual leave limit updated.",
                            isClaimed: true,
                        });
                    
                    })

                   
                });
            } else {
                // Handle the case where the insert didn't affect any rows
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
