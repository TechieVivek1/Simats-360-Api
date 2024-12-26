const con = require('../config');

const getGeneralDuty = (req, res) => {
    const { bioId, campus } = req.body;

    if (!bioId || !campus) {
        return res.status(400).json({ status: false, message: 'Missing Fields', generalDuties: [] });
    }

    const pendingDuty = `
        SELECT count(*) as generalPendingDuty
        FROM shift_assignments a 
        JOIN shift s 
        ON a.shift_name = s.shift_name 
        WHERE a.bio_id = ? 
        AND a.campus = ? 
        AND (a.status = 'pending' or a.status = 'rejected')
        AND a.startdate >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-21') 
        AND a.startdate < DATE_FORMAT(CURDATE(), '%Y-%m-21')` ;

    con.query(pendingDuty, [bioId, campus], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                status: false, 
                message: `Error Fetching Duty: ${err.message}`, 
                generalDutiesCount: result[0].generalPendingDuty
            });
        }

        if (result.length > 0) {

            return res.status(200).json({ 
                status: true, 
                message: "Duty Count Fetched Successfully", 
                generalDutiesCount: result[0].generalPendingDuty 
            });
        } else {
            return res.status(200).json({ 
                status: false, 
                message: "No Duty Found", 
                generalDutiesCount: result[0].generalPendingDuty 
            });
        }
    });
};

module.exports = getGeneralDuty;
