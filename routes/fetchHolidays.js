const con = require('../config')

async function fetchHolidays (req,res){

    const  { campus } = req.body;

    if(!campus){
        return res.status(400).json({message: 'Please provide campus name'})
    }

    let query = `SELECT date FROM declared_holidays WHERE campus = ?`;

    con.query(query,[campus],(err,result,field)=>{
        if(err){
            res.status(500).json({error:err})
        } 
        res.status(200).json({status:true,data:result})
    })
}

module.exports = fetchHolidays
