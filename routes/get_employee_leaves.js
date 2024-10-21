const con = require('../config');

const  leaveInfo = async (req, res) => {

    const { category, campus, bio_id } = req.body

    if(!bio_id || !category || !campus) {
        return res.status(400).json({ status: false, message: 'Empty Fields', data: []})
    }
    
    let  query = `select 
                    casual_leave_limit   as casualLeave, 
                    sick_leave_limit     as sickLeave, 
                    earned_leave_limit   as earnedLeave, 
                    academic_leave_limit as academicLeave 
                    from available_leave 
                    where bio_id = ? 
                    and campus   = ?
                    and category = ?`;

    con.query(query, [ bio_id, campus, category ], async (err, results, fields) => {

        if (err) {
            return res.status(500).json({ status: false, message: 'Error fetching user info', data: [], error:err })
        }

        if(results.length === 0) {
            return res.status(404).json({ status: false, message: 'No Data Found', data: []});
        }
        
        return res.status(200).json({
            status  : true,
            message : 'Success',
            data    : results
        });
        
    })
    
}

module.exports  = leaveInfo;
