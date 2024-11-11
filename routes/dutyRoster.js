const con = require('../config');

const dutyRoster = (req, res) => {
  const { requestFrom, requestTo, deptId } = req.body;

  if (!requestFrom || !requestTo || !deptId) {
    return res.status(400).json({ status: false, message: 'Invalid or missing fields', data: [] });
  }

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
      return res.status(404).json({ status: false, message: 'No record found with the provided department', data: [] });
    }

    return res.status(200).json({ status: true, message: 'Duty Schedule fetched successfully', data: resultData });
  });
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

  // Convert the object to an array of day objects
  return Object.keys(parsed).map(day => ({ day, swipes: parsed[day] }));
}

module.exports = dutyRoster;
