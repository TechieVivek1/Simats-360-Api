const db = require('../config');

const approvalNotification = (req, res) => {
    const { bioId, campus } = req.body;

    const fetchQuery = `
        SELECT 
           a.id, 
            a.campus, 
            a.bio_id, 
            e.employee_name, 
            e.phone, 
            e.designation, 
            a.category AS leaveCategory, 
            a.start_date,
            a.reason,
            e.profileImg,
            a.leave_type as leaveType,
            a.file
        FROM 
            apply_leave a 
        LEFT JOIN 
            emp_ref e ON a.bio_id = e.bio_id 
        WHERE 
            a.campus = ? AND a.assigned_head_id = ? and a.status ='Pending'
        AND a.start_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) + INTERVAL (21 - DAY(CURDATE())) DAY `;


    if (!bioId || !campus) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            notificationData: []
        });
    }

    db.query(fetchQuery, [campus, bioId], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: `Internal Server Issue: ${ err.message }`,
                notificationData: []
            });
        }

        if (result.length > 0) {
            const notificationData = result.map(item => {
                return {
                    ...item,
                    start_date: new Date(item.start_date).toLocaleDateString('en-CA'),
                    profileImg: `${ getBaseUrl(req) }` + `/${ item.profileImg }`,
                    file:`${ getBaseUrl(req) }` +`/${ item.file }`

                };
            });

            return res.status(200).json({
                status: true,
                message: "Notification Fetched Successfully",
                notificationData
            });

        } else {
            return res.status(200).json({
                status: false,
                message: "No Data Found",
                notificationData: []
            });
        }
    });
}

const getBaseUrl = (req) => {
    const protocol = req.protocol;
    const host = req.get('host');
    return `${ protocol }://${host}`;
};

module.exports = approvalNotification;
