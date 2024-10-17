
const con = require('../config')
const empDetails = require('../routes/empDetails')

const  userInfo = async (req,res)=>{

    const {bio_id,campus} = req.body

    if(!bio_id){
        return res.status(400).json({message: 'bio_id is required'})
    }
    if(!campus){
        return res.status(400).json({message: 'campus is required'})
    }
    
    let  query = `SELECT e.campus,e.employee_name,e.category,e.dob,e.doj,e.phone,e.email,e.address,p.profileImg,e.bio_id,e.staff_id,e.designation_id,d.designation_name FROM emp_ref e JOIN profileimages p ON e.bio_id = p.bio_id JOIN designation d ON e.designation_id = d.designation_id WHERE e.bio_id = ?;`

    con.query(query,[bio_id], async (err, results,fields) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user info',error:err })
        }

        if(results.length === 0){
            return res.status(404).json({message: 'User not found'})
        }

        
        // const [buffResult, holidayResult] = await Promise.all([
        //     buffData(campus, category),
        //     holiday(campus)
        // ]);

        let empDetailsResultData = {}
        let empDetailsResult = await empDetails(campus, bio_id)
        

        if (empDetailsResult && empDetailsResult.status) {
            empDetailsResultData = empDetailsResult.empDetails;
        };

        return res.status(200).json({
            status:200,
            message: 'User info fetched successfully',
            data: results,
            internalExp: empDetailsResultData.internal_experience,
            externalExp: empDetailsResultData.external_experience
        })
        
    })
    
}

module.exports  = userInfo;
