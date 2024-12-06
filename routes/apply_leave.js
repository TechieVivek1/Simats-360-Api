const con = require('../config');
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


const applyLeave = async (req, res) => {

    upload.fields([{ name: 'file', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            console.error("Multer error: ", err.message);
            return res.status(400).send({ status: 400, message: err.message });
        }


        let { campus, bioId, leaveCategory, leaveType, daySession,
            startDate, endDate, totalDays, headId, reason } = req.body

        if (!bioId || !campus || !leaveCategory || !leaveType || !startDate || !totalDays || !headId || !reason) {
            return res.status(400).json({ status: false, message: 'Empty Fields' })
        }

        const fileName = req.files['file'] ? req.files['file'][0].filename : '';

        if (leaveType === "half_day") {
            endDate = startDate
        } else {
            endDate = startDate
            daySession = null;
        }

        let query = `insert 
                        into  apply_leave 
                        (campus, bio_id, category, leave_type, half_day_session, 
                        start_date, end_date, total_days, assigned_head_id, reason, 
                        file)
                        values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        let seletQuery = `SELECT * 
                            FROM apply_leave 
                            WHERE bio_id   = ?
                            AND leave_type = ?
                            AND start_date = ?
                            AND end_date   = ?`;

        con.query(seletQuery, [bioId, leaveType, startDate, endDate], (err, result) => {

            if (err) {
                return res.status(500).json({ status: false, message: 'Server Error', error: err.message });
            }

            if (result.length != 0) {
                return res.status(409).json({
                    status: false,
                    message: 'Leave Already Applied'
                });
            }

            con.query(query, [campus, bioId, leaveCategory, leaveType, daySession, startDate, endDate,
                totalDays, headId, reason, "uploads/" + fileName], async (err, results, fields) => {

                    if (err) {
                        return res.status(500).json({ status: false, message: 'Server Error', error: err.message });
                    }

                    if (results.affectedRows > 0) {
                        return res.status(200).json({
                            status: true,
                            message: 'Leave Applied Successfully'
                        });
                    } else {
                        return res.status(400).json({
                            status: true,
                            message: 'Your application not processed at the momemt..'
                        });
                    }

                })
        })


    })
}

module.exports = applyLeave;