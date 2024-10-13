const con =  require('../config');

   async function shift(campus,bio_id){

    try {
        let  query =  `SELECT shift FROM employee_details WHERE campus = ?  AND bio_id = ?`

        con.query(query,[campus,bio_id],(err,results,fileds)=>{
            if(err){
                return {status:false,message: 'Error in database query',error:err}
            }
            
            if(results.length > 0){
                return {status:true,shift:results[0].shift}
            }else{
                return {status:false,message: 'No record found for the given campus and bio_id'}
            }
    
        })
    
    } catch (error) {
        return  {status:false,message: 'Error in database query',error:error}

    }
   

} 

module.exports = shift
