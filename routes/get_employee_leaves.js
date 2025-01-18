const con = require('../config');

const leaveInfo = async (req, res) => {
    const { category, campus, bio_id } = req.body;

    if (!bio_id || !category || !campus) {
        return res.status(400).json({ status: false, message: 'Empty Fields', data: {} });
    }

    const mapLeaveCheckQuery = `SELECT COUNT(*) as count FROM map_leave WHERE campus = ? AND category = ?`;
    con.query(mapLeaveCheckQuery, [campus, category], (err, mapLeaveCheckResults) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ status: false, message: 'Error fetching map_leave info', error: err });
        }

        const mapLeaveCount = mapLeaveCheckResults[0].count;

        if (mapLeaveCount === 0) {
            return res.status(404).json({ status: false, message: 'No mapped leaves found', data: {} });
        }

        const leaveTypesQuery = `SELECT leave_name FROM leavetypes WHERE campus = ?`;
        con.query(leaveTypesQuery, [campus], (err, leaveTypesResults) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ status: false, message: 'Error fetching leave types', error: err });
            }

            const leaveTypes = {};
            const promises = leaveTypesResults.map((row) => {
                const leaveName = row.leave_name;

                return new Promise((resolve) => {
                    const mappingCheckQuery = `SELECT time_interval FROM map_leave WHERE campus = ? AND category = ? AND leave_name = ?`;
                    con.query(mappingCheckQuery, [campus, category, leaveName], (err, mappingResults) => {
                        if (err || mappingResults.length === 0) {
                            resolve(); 
                            return;
                        }

                        const columnName = `${leaveName.toLowerCase().replace(/ /g, '_')}_limit`;
                        const availabilityQuery = `SELECT ?? FROM available_leave WHERE campus = ? AND category = ? AND bio_id = ?`;
                        con.query(availabilityQuery, [columnName, campus, category, bio_id], (err, availabilityResults) => {
                            if (err || availabilityResults.length === 0) {
                                resolve(); 
                                return;
                            }

                            const availability = availabilityResults[0][columnName];

                            if (availability !== null && availability !== '') {
                                const camelKey = leaveName
                                    .replace(/\b\w/g, (char) => char.toUpperCase()) 
                                    .replace(/ /g, '') 
                                    .replace(/^./, (char) => char.toLowerCase()); 
                                leaveTypes[camelKey] = availability;
                            }

                            resolve();
                        });
                    });
                });
            });

            Promise.all(promises).then(() => {
                return res.status(200).json({
                    status: true,
                    message: 'Success',
                    data: leaveTypes,
                });
            });
        });
    });
};

module.exports = leaveInfo;
