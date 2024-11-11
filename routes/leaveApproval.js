const con = require('../config');


module.exports = leaveApproval = (req, res) => {
    const { status, leaveId } = req.body;

    if (!status || !leaveId) {
        return res.status(400).json({ status: false, message: 'Invalid or missing fields', data: {} });
    }

    const query = `update apply_leave set status = ? where id = ?`;
    const params = [status , leaveId];

    con.query(query, params, (err, result) => {
        if (err) {
            // console.error("Database query error:", err);
            return res.status(500).json({ status: false, message: 'Error updating approval', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: 'No record found ', data: {} });
        }

        return res.status(200).json({ status: true, message: 'Leave approval updated successfully', data: { leaveId } });
    });
};
