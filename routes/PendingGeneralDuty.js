const con = require('../config');

const getGeneralDuty = (req, res) => {
    const { bioId, campus } = req.body;

    if (!bioId || !campus) {
        return res.status(400).json({ status: false, message: 'Missing Fields', generalDuties: [] });
    }

    const pendingDuty = `
        SELECT *
        FROM shift_assignments a 
        JOIN shift s 
        ON a.shift_name = s.shift_name 
        WHERE a.bio_id = ? 
        AND a.campus = ? 
        AND (a.status = 'pending' or a.status = 'rejected') 
        AND a.startdate >= DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-21') 
        AND a.startdate < DATE_FORMAT(CURDATE(), '%Y-%m-21')`;

    con.query(pendingDuty, [bioId, campus], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                status: false, 
                message: `Error Fetching Duty: ${err.message}`, 
                generalDuties: [] 
            });
        }

        if (result.length > 0) {
            const formattedResult = result.map(item => {
                // Parse and format shift_date
                const [day, month, year] = item.shift_date.split('-');
                const parsedDate = `${year}-${month}-${day}`;
                const formattedShiftDate = !isNaN(new Date(parsedDate).getTime())
                    ? new Date(parsedDate).toLocaleDateString('en-CA')
                    : 'Invalid Date';

                // Format created_at and updated_at
                const formattedCreatedAt = new Date(item.created_at).toLocaleString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                const formattedUpdatedAt = new Date(item.updated_at).toLocaleString('en-CA', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                });

                return {
                    ...item,
                    shift_date: formattedShiftDate, 
                    created_at: formattedCreatedAt, 
                    updated_at: formattedUpdatedAt, 
                };
            });

            return res.status(200).json({ 
                status: true, 
                message: "Duty Fetched Successfully", 
                generalDuties: formattedResult 
            });
        } else {
            return res.status(200).json({ 
                status: false, 
                message: "No Duty Found", 
                generalDuties: [] 
            });
        }
    });
};

module.exports = getGeneralDuty;
