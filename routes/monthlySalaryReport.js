const db = require('../config')

const monthlySalaryReport = (req,res) => {
    const bioId = req.body.bioId
    if (!bioId) {
        return res.status(422).json({
            status: false,
            message: "Parameter is missing",
            salaryReportData: []
            
        })
    }
    const query = 'SELECT * From salary_details WHERE bio_id = ?';

    db.query(query, bioId,(err,result) => {
        if (err) {
            console.error('Database error:', err);
        return res.status(500).json({ 
            status: false, 
            message: 'Internal server error',
            monthlySalaryReportData: []
        });
        }
        if (result.length == 0) {
            return res.status(400).json({ 
                status: false, 
                message: 'No Data Found',
                monthlySalaryReportData: []
        })
    }

    return res.status(200).json( {
        status: true,
        message: "Data Fetched Succesfully",
        salaryReportData: result
    })

    })
}

module.exports = monthlySalaryReport