const con = require('../config');

const getLeaves = async (req, res) => {
    const { campus, bio_id } = req.body;

    if (!bio_id || !campus) {
        return res.status(400).json({ status: false, message: 'Empty Fields' });
    }

    let query = `SELECT leave_type   as leaveType, 
                        start_date   as startDate,
                        end_date     as endDate,
                        category,
                        status 
                 FROM apply_leave 
                 WHERE bio_id = ? and campus = ?`;

    con.query(query, [bio_id, campus], async (err, results, fields) => {
        if (err) {
            return res.status(500).json({ status: false, message: 'Error fetching user info', data: [], error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: 'No Data Found', data: [] });
        }

        // Format the date to return only the date part in local timezone
        const formattedResults = results.map(leave => ({
            ...leave,
            startDate: new Date(leave.startDate).toLocaleDateString('en-CA'),  // Format date to 'YYYY-MM-DD'
            endDate: new Date(leave.endDate).toLocaleDateString('en-CA')      // Format date to 'YYYY-MM-DD'
        }));

        return res.status(200).json({
            status: true,
            message: 'Success',
            data: formattedResults
        });
    });
}

module.exports = getLeaves;
