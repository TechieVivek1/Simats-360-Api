const con = require('../config');


module.exports = swapApproval = (req, res) => {
    const { status, swapId } = req.body;

    if (!status || !swapId) {
        return res.status(400).json({ status: false, message: 'Invalid or missing fields', data: {} });
    }

    const query = `update duty_details set exchange_status = ? where id = ?`;
    const params = [status , swapId];

    con.query(query, params, (err, result) => {

        if (err) {
            return res.status(500).json({ status: false, message: 'Error updating swap', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: 'No record found ', data: {} });
        }

        return res.status(200).json({ status: true, message: 'Duty swap updated successfully', data: { swapId } });
    });
};
