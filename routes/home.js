const con = require("../config");
const punchData = require('./punchData');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift')
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
        let shiftResultsData = []

        if (punchResult && punchResult.status) {
            punchResultData = punchResult.data;
        }

        if (empDetailsResult && empDetailsResult.status) {
            empDetailsResulttResultData = empDetailsResult.empDetails;
        }


        const shiftResult = await shiftData(empDetailsResulttResultData.shift)

        if (shiftResult && shiftResult.status) {
            shiftResultsData = shiftResult.data
        }
        

        res.json({ punch: punchResultData, empDetails: empDetailsResulttResultData ,shift:shiftResultsData});

    } catch (error) {

        res.status(500).json({ status: false, message: "Server error", error });
    }
};

module.exports = homeInfo;
