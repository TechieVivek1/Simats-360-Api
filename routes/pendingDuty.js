const con = require('../config');

const getPendingCount = (req, res) => {
    const { bioId } = req.body;

    if (!bioId) {
        return res.status(400).json({ status: false, message: 'Missing bioId' });
    }

    const pendingDuty = `
        SELECT id as dutyId, startdate, shift, total_hours, duty_swipe, swipe_details, duty_status
        FROM duty_details
        WHERE bio_id = ? 
        AND (exchange_status = 'Pending' OR exchange_status = 'Rejected')`;

    con.query(pendingDuty, [bioId], (err, result) => {
        if (err) {
            return res.status(500).json({ status: false, message: `Error Fetching Duty: ${err.message}`, result: [] });
        }

        if (result.length > 0) {
            // Format startdate for each result
            const formattedResult = result.map((duty) => {
                const startDate = new Date(duty.startdate).toLocaleDateString('en-CA');
                return { ...duty, startdate: startDate };
            });

            return res.status(200).json({ status: true, message: "Pending Duty Fetched Successfully", result: formattedResult });
        } else {
            return res.status(200).json({ status: false, message: "No Pending Duty", result: [] });
        }
    });
};

module.exports = getPendingCount;
