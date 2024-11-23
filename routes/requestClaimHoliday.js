const db = require("../config");

const requestHolidayCredits = (req, res) => {
  const { campus, bioId, dutyDate, credits } = req.body;

  if (!campus || !bioId || !dutyDate || !credits) {
    return res.status(400).json({
      status: false,
      message: "Missing required fields",
    });
  }

  const checkDuplicateQuery =
    "SELECT * FROM holiday_cl_request WHERE bio_id = ? AND duty_date = ?";
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
        message: "Credits request already received.",
        isClaimed: false,
      });
    }

    const insertQuery =
      "INSERT INTO holiday_cl_request (campus, bio_id, duty_date, credit_request) VALUES (?, ?, ?, ?)";
    db.query(insertQuery, [campus, bioId, dutyDate, credits], (err, result) => {
      if (err) {
        return res.status(500).json({
          status: false,
          message: "Internal server Error",
          isClaimed: false,
        });
      }

      if (result.affectedRows > 0) {
        return res.status(201).json({
          status: true,
          message:
            "Credit requested successfully ",
          isClaimed: true,
        });
      } else {
        return res.status(500).json({
          status: false,
          message: "Failed to request credits.",
          isClaimed: false,
        });
      }
    });
  });
};

module.exports = requestHolidayCredits;
