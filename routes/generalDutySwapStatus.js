const con = require("../config");

module.exports = async (req, res) => {
  const { bioId, campus } = req.body;

  if (!bioId || !campus) {
    return res
      .status(404)
      .json({
        status: false,
        message: "Required fields missing",
        generalSwapStatus: [],
      });
  }

  let query =`SELECT * FROM shift_assignments WHERE bio_id = ? and campus = ? AND duty_exchanged = "yes"`;

  con.query(query, [bioId, campus], (err, result) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Internal server error " +"Error:"+ err.message,
        generalSwapStatus: [],
      });
    }

    if (result.length > 0) {
      return res.status(200).json({
        status: true,
        message: "General swap status",
        generalSwapStatus: result,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "No general swap status found",
        generalSwapStatus: result,
      });
    }
  });
};
