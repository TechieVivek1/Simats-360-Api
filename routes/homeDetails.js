const con = require("../config");
const punchData = require('./updated_punch');
const empDetailsData = require('./empDetails');
const shiftData = require('./shift');
const buffData = require('./bufferTime');
const holiday = require('./holidays');

const ho = async (req, res) => {
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


const multer = require('multer');
const path = require('path');
const fs = require('fs');

const demoFileDir = path.join(__dirname, 'uploads');

const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

ensureDirectoryExistence(demoFileDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'file') {
            cb(null, demoFileDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const ap = async (req, res) => {
    upload.fields([{ name: 'file', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            console.error("Multer error: ", err.message);
            return res.status(400).send({ status: 400, message: err.message });
        }

        let { campus, bioId, leaveCategory, leaveType, daySession,
            startDate, endDate, totalDays, headId, reason, status ,createdOn,updatedOn} = req.body;

        if (!bioId || !campus || !leaveCategory || !leaveType || !startDate || !totalDays || !headId || !reason || !status || !createdOn || !updatedOn) {
            return res.status(400).json({ status: false, message: 'Empty Fields' });
        }

        const fileName = req.files['file'] ? req.files['file'][0].filename : '';

        if (leaveType === "half_day") {
            endDate = startDate;
        } else {
            endDate = startDate;
            daySession = null;
        }

        let insertQuery = `INSERT INTO apply_leave 
                        (campus, bio_id, category, leave_type, half_day_session, 
                        start_date, end_date, total_days, assigned_head_id, reason, 
                        file, status, create_on, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`;

        let selectQuery = `SELECT campus, bio_id, category, leave_type, half_day_session, 
                                  start_date, end_date, total_days, assigned_head_id, reason, 
                                  file, status, hr_status, create_on, updated_at
                           FROM apply_leave 
                           WHERE bio_id = ?
                           AND leave_type = ?
                           AND start_date = ?
                           AND end_date = ?`;

        con.query(selectQuery, [bioId, leaveType, startDate, endDate], (err, result) => {
            if (err) {
                return res.status(500).json({ status: false, message: 'Server Error', error: err.message });
            }

            if (result.length !== 0) {
                return res.status(409).json({
                    status: false,
                    message: 'Leave Already Applied',
                    data: result[0] // Returning the existing leave details
                });
            }

            con.query(insertQuery, [campus, bioId, leaveCategory, leaveType, daySession, startDate, endDate,
                totalDays, headId, reason, "uploads/" + fileName, status,createdOn,updatedOn], async (err, results) => {

                if (err) {
                    return res.status(500).json({ status: false, message: 'Server Error', error: err.message });
                }

                if (results.affectedRows > 0) {
                    // Fetch the newly inserted leave details
                    con.query(selectQuery, [bioId, leaveType, startDate, endDate], (err, newResult) => {
                        if (err) {
                            return res.status(500).json({ status: false, message: 'Error fetching leave data', error: err.message });
                        }

                        return res.status(200).json({
                            status: true,
                            message: 'Leave Applied Successfully',
                            data: newResult[0] // Returning the newly applied leave details
                        });
                    });
                } else {
                    return res.status(400).json({
                        status: false,
                        message: 'Your application was not processed at the moment.'
                    });
                }
            });
        });
    });
};


module.exports = {ho,ap};
