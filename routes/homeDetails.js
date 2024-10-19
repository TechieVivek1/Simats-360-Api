const con = require("../config");
const punchData = require('./updated_punch');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift');
const buffData = require('./bufferTime');
const holiday = require('./holidays');



const homeInfo = async (req, res) => {
    const { bio_id, campus, category, year, month } = req.body;

    if (!bio_id || !campus || !category || !year || !month) {
        return res.status(400).json({ status: false, message: "All fields are required" });
    }

    try {
        const [punchResult, empDetailsResult] = await Promise.all([
            punchData(bio_id, year, month),
            empDetailsData(campus, bio_id)
        ]);

        let punchResultData = punchResult?.status ? punchResult.data : [];
        let empDetailsResultData = empDetailsResult?.status ? empDetailsResult.empDetails : {};
        let shiftResultsData = {};
        let buffResultsData = 0;
        let holidayResultData = [];

        const [buffResult, holidayResult] = await Promise.all([
            buffData(campus, category),
            holiday(campus)
        ]);

        if (buffResult?.status) {
            buffResultsData = buffResult.bufferTimeData || 0;
        }

        if (holidayResult?.status) {
            holidayResultData = holidayResult.data.map(h => new Date(h).toISOString().split('T')[0]);
        }

        if (empDetailsResultData.shift) {
            const shiftResult = await shiftData(empDetailsResultData.shift);
            if (shiftResult?.status) {
                shiftResultsData = shiftResult.data;
            }
        }

        res.json({
            punch: punchResultData,
            empDetails: empDetailsResultData,
            shift: shiftResultsData,
            basicBuff: buffResultsData,
            holidays: holidayResultData,
        });

    } catch (error) {
        res.status(500).json({ status: false, message: "Server error", error: error.message });
    }
};

module.exports = homeInfo;
