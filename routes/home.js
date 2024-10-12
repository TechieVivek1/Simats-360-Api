const con = require("../confing")
const attendance = require('../routes/attendance_punch')
const punch_url = process.env.ATTENDANCE_URL

const homeInfo = async(req,res) =>{

    const {bio_id} =  req.body

    if(!bio_id){
        return res.status(400).json({message:"bio_id is required"})
    }


    const attendancejson = await attendance(bio_id,punch_url)

    res.json(attendancejson)

    // if(!campus){
    //     return res.status(400).json({message:"campus is required"})
    // }

    // let  query = ``;
    // query += `SELECT * FROM home_info WHERE bio_id = '${bio_id}' AND campus ='${campus}'`
    // con.query(query, (err, result) => {
    //     if (err) {
    //         return res.status(500).json({ message: "Error fetching data" });
    //     }
    //         if(result.length > 0){
    //             return res.status(200).json(result)
    //         }
    //         else{
    //             return res.status(404).json({message:"No data found"})
    //         }
    // })


                    

}

module.exports = homeInfo