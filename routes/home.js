const con = require("../config")
const punchData = require('./punchData')
const shiftData = require('./shift')
const punch_url = process.env.ATTENDANCE_URL

const homeInfo = async(req,res) =>{

    const {bio_id,campus} =  req.body

    if(!bio_id){
        return res.status(400).json({status:false,message:"bio_id is required"})
    }
    if(!campus){
        return res.status(400).json({status:false,message:"campus is required"})
    }
    
    const punchResult = await punchData(bio_id)
    let punchResultData =[]

    if(punchResult.status){
         punchResultData=  punchResult.data
    }

    const shiftResult = await shiftData(campus,bio_id)

    res.json({punch:punchResultData,shift:shiftResult})      
    // res.json({shiftResult})      

}

module.exports = homeInfo