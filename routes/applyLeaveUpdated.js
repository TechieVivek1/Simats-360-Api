const path = require('path');
const { DateTime } = require('luxon');
const fs = require('fs');

async function applyLeave({category,startDate,endDate,halfDaySession,reason,
    leaveType,bio_id,campus,file}) {
    if (!bio_id || !campus) {
        throw new Error('bio_id or campus not provided.');
    }

    try {
        const formattedCategory = category.toLowerCase().replace(' ', '_') + '_limit';

        // Fetch 'duringprobation' and 'avail_per_month' from the database
        const [leaveCategoryRow] = await db.query(
            'SELECT duringprobation, avail_per_month FROM add_leave_category WHERE campus = ? AND leave_name = ?',
            [campus, category]
        );
        const { duringprobation, avail_per_month } = leaveCategoryRow;

        // Fetch 'minimalpreleavebuffer' from the database
        const [preleaveBufferRow] = await db.query(
            'SELECT minimalpreleavebuffer FROM add_leave_category WHERE campus = ? AND leave_name = ?',
            [campus, category]
        );
        const { minimalpreleavebuffer } = preleaveBufferRow;

        // Check if the leave is being requested with sufficient pre-leave buffer
        const start_date = DateTime.fromISO(startDate);
        const current_date = DateTime.now();
        const required_date = start_date.minus({ hours: minimalpreleavebuffer });

        if (current_date > required_date) {
            throw new Error(`You must apply for leave at least ${minimalpreleavebuffer} hours before the start date.`);
        }

        // Check probation status if not during probation
        if (duringprobation !== 'Yes') {
            const [probationRow] = await db.query(
                'SELECT probation_status, extend_probation_status FROM probation_notice_period WHERE campus = ? AND bio_id = ?',
                [campus, bio_id]
            );

            if (probationRow && (probationRow.probation_status === 'Pending' || probationRow.extend_probation_status === 'Pending')) {
                throw new Error('Your probation status is pending. You cannot apply for leave.');
            }
        }

        // Fetch 'minimalexperience' from the database
        const [minimalExperienceRow] = await db.query(
            'SELECT minimalexperience FROM add_leave_category WHERE campus = ? AND leave_name = ?',
            [campus, category]
        );
        const { minimalexperience } = minimalExperienceRow;

        // Fetch Date of Joining (doj)
        const [dojRow] = await db.query(
            'SELECT doj FROM emp_ref WHERE campus = ? AND bio_id = ?',
            [campus, bio_id]
        );
        const doj = DateTime.fromISO(dojRow.doj);
        const today = DateTime.now();
        const experience = today.diff(doj, 'days').days;

        if (experience < minimalexperience) {
            throw new Error('You do not meet the minimal experience requirement for this leave.');
        }

        // Calculate total days for leave
        let totalDays;
        if (leaveType === 'half_day') {
            totalDays = 0.5;
        } else {
            const end_date = DateTime.fromISO(endDate);
            totalDays = end_date.diff(start_date, 'days').days + 1;
        }

        // Fetch leave balance from the database
        const [leaveLimitRow] = await db.query(
            `SELECT ${formattedCategory} FROM available_leave WHERE campus = ? AND bio_id = ?`,
            [campus, bio_id]
        );
        const availableLimit = leaveLimitRow[formattedCategory];
        console.log(formattedCategory);
        

        if (totalDays > availableLimit) {
            throw new Error('You do not have enough leave balance.');
        }

        // Check avail_per_month functionality
        const currentMonth = DateTime.now().toFormat('yyyy-MM');
        const [monthLeaveRow] = await db.query(
            `SELECT SUM(total_days) as total_taken FROM apply_leave WHERE bio_id = ? AND category = ? AND campus = ? AND DATE_FORMAT(start_date, '%Y-%m') = ? AND status = 'Approved'`,
            [bio_id, category, campus, currentMonth]
        );
        const total_taken_in_month = monthLeaveRow.total_taken || 0;

        if ((total_taken_in_month + totalDays) > avail_per_month) {
            throw new Error('You have exceeded the maximum number of leaves allowed per month.');
        }

        // Handle file upload
        let file_path = null;
        if (file) {
            const { size, mimetype, filename } = file;
            const allowedTypes = ['image/png', 'image/jpeg'];

            // Limit 5MB for file size
            if (size > 5000000) {
                throw new Error('File is too large. Maximum size is 5MB.');
            }

            if (!allowedTypes.includes(mimetype)) {
                throw new Error('Invalid file type. Only PNG and JPEG are allowed.');
            }

            file_path = path.join(__dirname, 'uploads', filename);
            fs.renameSync(file.path, file_path); // Move the file to the final location
        }

        // Fetch the reporting authority
        const [headRow] = await db.query(
            'SELECT head_id FROM hierarchy_master WHERE assigned_employee_id = ?',
            [bio_id]
        );
        if (!headRow) {
            throw new Error('Reporting authority is not assigned. Please contact the administrator.');
        }

        const assigned_head_id = headRow.head_id;

        // Insert leave application into the database
        const status = 'Pending';
        await db.query(
            `INSERT INTO apply_leave (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bio_id, category, leaveType, halfDaySession, startDate, endDate, totalDays, reason, file_path, campus, assigned_head_id, status
            ]
        );

        return { message: 'Leave application submitted successfully.' };
    } catch (error) {
        console.error('Error processing leave application:', error);
        throw error;
    }
}

module.exports = applyLeave;
