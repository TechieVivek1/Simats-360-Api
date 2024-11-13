const con = require('../config');

const dutyRoster = async (req, res) => {
  let deptId;
  const { requestFrom, requestTo,bioId,campus } = req.body;

  if (!requestFrom || !requestTo || !bioId || !campus) {
    return res.status(400).json({ status: false, message: 'Invalid or missing fields', data: [] });
  }  

  const deptIdQuery = `SELECT department_id FROM emp_ref WHERE bio_id = ? AND campus = ?`

  con.query(deptIdQuery,[bioId,campus],(err,rows)=>{
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ status: false, message: 'Error fetching duty details', error: err });
    }

    if (rows.length > 0) {

        deptId = rows[0].department_id

        const query = `SELECT *
        FROM duty_details duty
        JOIN emp_ref emp ON duty.bio_id = emp.bio_id
        JOIN duty_group_employee emp_grp ON emp_grp.bio_id = emp.bio_id
        JOIN duty_group grp ON grp.group_id = emp_grp.group_id
        JOIN department dept ON dept.department_id = emp.department_id
        WHERE CAST(duty.startdate AS DATE) BETWEEN ? AND ?
        AND dept.department_id = ?;`;
        const params = [requestFrom, requestTo, deptId];

        con.query(query, params, (err, result) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ status: false, message: 'Error fetching duty details', error: err });
        }

        var resultData = result.map(item => {
          return {
            dutyId:item.id,
            empId:item.bio_id,
            empName:item.employee_name,
            profileImg:item.profileImg,
            shift:item.shift,
            swipeData:parseSwipeDetails(item.swipe_details),
            contact:item.contact,
            designation:item.designation,
            department:item.department_name,
            group:item.group_name
          }
        })

        if (result.length === 0) {
          return res.status(404).json({ status: false, message: 'No record found for you', data: [] });
        }

        return res.status(200).json({ status: true, message: 'Duty Schedule fetched successfully', data: resultData });
      });

    } else{
      return res.status(404).json({ status: false, message: 'No department found for you', data: [] });
    }

  })

  
};


function parseSwipeDetails(swipeDetails) {
  const parsed = {};
  const regex = /Day (\d+) - Swipe Time - (\d{2}:\d{2})/g;
  let match;

  while ((match = regex.exec(swipeDetails)) !== null) {
      const day = `Day ${match[1]}`;
      const time = match[2];
      
      if (!parsed[day]) {
          parsed[day] = [];
      }
      parsed[day].push({ "Swipe Time": time });
  }

  return Object.keys(parsed).map(day => ({ day, swipes: parsed[day] }));
}

module.exports = dutyRoster;
