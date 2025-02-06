const db = require('../config');

const claimHolidayCredits = (req, res) => {
    const { campus,bioId,dutyDate,credits } = req.body;

    if (!campus|| !bioId || !dutyDate || !credits) {
        return res.status(400).json({
            status: false,
            message: "Missing required fields"
        });
    }

    const checkDuplicateQuery = 'SELECT * FROM holiday_credits_claim WHERE bio_id = ? AND duty_date = ?';
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
                message: "Credits already claimed.",
                isClaimed: false,
            });
        }

        const insertQuery = 'INSERT INTO holiday_credits_claim (campus, bio_id, duty_date, credits_earned) VALUES (?, ?, ?, ?)';
        db.query(insertQuery, [campus, bioId, dutyDate, credits], (err, result) => {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: "Internal server Error",
                    isClaimed: false,
                });
            }

            if (result.affectedRows > 0) {
                const updateQuery = 'UPDATE available_leave SET casual_leave_limit = casual_leave_limit + 1 WHERE bio_id = ? AND campus = ?';
                db.query(updateQuery, [bioId, campus], (err, updateResult) => {
                    if (err) {
                        return res.status(500).json({
                            status: false,
                            message: "Internal server Error while updating casual leave limit.",
                            isClaimed: false, 
                        });
                    }


                        return res.status(201).json({
                            status: true,
                            message: "Credits claimed successfully and casual leave limit updated.",
                            isClaimed: true,
                        });
                   
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: "Failed to claim credits.",
                    isClaimed: false,
                });
            }
        });
    });
};

module.exports = claimHolidayCredits;
