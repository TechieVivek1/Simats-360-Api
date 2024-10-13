const con = require("../config");
const punchData = require('./punchData');
const empDetailsData = require('./empDetails');
const punch_url = process.env.ATTENDANCE_URL;

const homeInfo = async (req, res) => {
    const { bio_id, campus } = req.body;

    if (!bio_id) {
        return res.status(400).json({ status: false, message: "bio_id is required" });
    }
    if (!campus) {
        return res.status(400).json({ status: false, message: "campus is required" });
    }

    try {
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bio_id),
            empDetailsData(campus, bio_id)
        ]);

        let punchResultData = [];
        let empDetailsResulttResultData = [];

        if (punchResult && punchResult.status) {
            punchResultData = punchResult.data;
        }

        if (empDetailsResult && empDetailsResult.status) {
            empDetailsResulttResultData = empDetailsResult.empDetails;
        } 


        res.json({ punch: punchResultData, empDetails: empDetailsResulttResultData });

    } catch (error) {

        res.status(500).json({ status: false, message: "Server error", error });
    }
};

module.exports = homeInfo;
