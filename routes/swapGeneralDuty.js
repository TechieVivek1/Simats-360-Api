const con = require('../config');

const updateDutyExchange = (req, res) => {
  const { requestFrom, requestTo, id } = req.body;

  // console.log(req.body)

  if (!requestFrom || !requestTo || !id) {
    return res.status(400).json({ status: false, message: 'Invalid or missing fields', data: {} });
  }

  const query = `UPDATE shift_assignments SET duty_exchanged = 'Yes', exchange_from = ?, exchange_to = ? WHERE id = ?`;
  const params = [requestFrom, requestTo, id];

  con.query(query, params, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ status: false, message: 'Error updating duty details', data: {} });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: false, message: 'No record found for the provided info', data: {} });
    }

    return res.status(200).json({ status: true, message: 'Duty exchange updated successfully', data: { id } });
  });
};

module.exports = updateDutyExchange;
