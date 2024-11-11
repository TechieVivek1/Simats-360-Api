const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config'); // Importing pool from your config.

const demoFileDir = path.join(__dirname, 'uploads');

const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};
ensureDirectoryExistence(demoFileDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, demoFileDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.body.bioId}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

const applyLeave = async (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        let { campus, bioId, leaveCategory, leaveType, daySession, startDate, endDate, reason } = req.body;
        let file = req.file ? req.file.filename : null;

        if (!bioId || !campus || !leaveCategory || !leaveType || !startDate || !reason) {
            return res.status(400).json({ status: false, message: 'Empty Fields' });
        }

        try {
            await query('START TRANSACTION');

            // Fetch probation status
            const probationResult = await query(`
                SELECT probation_status, extend_probation_status 
                FROM probation_notice_period 
                WHERE campus = ? AND bio_id = ?`,
                [campus, bioId]
            );
            const probation = probationResult[0];
            if (probation?.probation_status === 'Pending' || probation?.extend_probation_status === 'Pending') {
                return res.status(403).json({ status: false, message: 'Cannot apply for leave during pending probation' });
            }

            // Fetch category-specific limits and buffers
            const categoryResult = await query(`
                SELECT duringprobation, minimalpreleavebuffer, maximalpostprocessbuffer, minimalexperience, avail_per_month 
                FROM add_leave_category 
                WHERE campus = ? AND leave_name = ?`,
                [campus, leaveCategory]
            );
            const categoryLimits = categoryResult[0];

            // Check minimum experience requirement
            const dojResult = await query(`
                SELECT doj FROM emp_ref WHERE campus = ? AND bio_id = ?`,
                [campus, bioId]
            );
            const doj = new Date(dojResult[0].doj);
            const today = new Date();
            const experienceDays = Math.floor((today - doj) / (1000 * 60 * 60 * 24));
            if (experienceDays < categoryLimits.minimalexperience) {
                return res.status(403).json({ status: false, message: 'Minimal experience requirement not met' });
            }

            // Check leave buffer times
            const startDateTime = new Date(startDate);
            const currentDate = new Date();
            if (startDateTime < currentDate) {
                if (categoryLimits.maximalpostprocessbuffer > 0) {
                    const maxPostTime = new Date(startDateTime.getTime() + categoryLimits.maximalpostprocessbuffer * 60 * 60 * 1000);
                    if (currentDate > maxPostTime) {
                        return res.status(403).json({ status: false, message: 'Application outside allowed post-buffer time' });
                    }
                } else {
                    return res.status(403).json({ status: false, message: 'Past date leave requests are not permitted' });
                }
            } else if (categoryLimits.minimalpreleavebuffer > 0) {
                const minPreLeaveTime = new Date(startDateTime.getTime() - categoryLimits.minimalpreleavebuffer * 60 * 60 * 1000);
                if (currentDate > minPreLeaveTime) {
                    return res.status(403).json({ status: false, message: 'Insufficient pre-buffer time' });
                }
            }

            // Check leave availability and calculate total days
            const formattedCategory = leaveCategory.toLowerCase().replace(' ', '_') + '_limit';
            const availableLeaveResult = await query(`
                SELECT ${formattedCategory} FROM available_leave WHERE campus = ? AND bio_id = ?`,
                [campus, bioId]
            );
            const availableLimit = availableLeaveResult[0][formattedCategory];
            const totalDays = leaveType === 'half_day' ? 0.5 : Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

            if (totalDays > availableLimit) {
                return res.status(403).json({ status: false, message: 'Insufficient leave balance' });
            }

            // Check overlapping leave requests
            const overlapResult = await query(`
                SELECT COUNT(*) as count
                FROM apply_leave
                WHERE bio_id = ? 
                AND campus = ? 
                AND status != 'Rejected' 
                AND start_date = ?`,
                [bioId, campus, startDate]
            );
            if (overlapResult[0].count > 0) {
                return res.status(409).json({ status: false, message: 'Leave application overlaps with existing leave' });
            }

            // Submit leave application
            await query(`
                INSERT INTO apply_leave (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
                [bioId, leaveCategory, leaveType, daySession, startDate, endDate, totalDays, reason, file ? `uploads/${file}` : null, campus, req.body.headId]
            );

            await query('COMMIT');
            res.status(200).json({ status: true, message: 'Leave Applied Successfully' });
        } catch (error) {
            await query('ROLLBACK');
            res.status(500).json({ status: false, message: 'Server Error', error: error.message });
        }
    });
};

module.exports = applyLeave;
