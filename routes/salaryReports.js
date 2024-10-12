const db = require('../config')

const salaryReport = (req,res) => {
    const bioId = req.body.bioId
    if (!bioId) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            salaryReportData: []
            
        })
    }
    const fetchQuery = 'SELECT * From monthly_salary_report WHERE bio_id = ?';

    db.query(fetchQuery, bioId,(err, result) => {
            if (err) {
                console.error('Database error:', err);
            return res.status(500).json({ 
                status: false, 
                message: 'Internal server error',
                salaryReportData: []
            });
            }

            if (result.length == 0) {
                return res.status(404).json({ status: false, 
                    message: 'No Data Found',
                    salaryReportData: result
                 });
            }

            return res.status(200).json( {
                status: true,
                message: "Data Fetched Succesfully",
                salaryReportData: result
            })
    });


}

module.exports = salaryReport