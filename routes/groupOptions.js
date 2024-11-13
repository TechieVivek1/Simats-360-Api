const con = require('../config');

const getEmployeeOptions = (req, res) => {
  const { bioId, campus } = req.body;

  // Validate bioId and campus inputs
  if (!bioId ) {
    return res.status(400).json({ status: false, message: 'Invalid or missing bio_id', data: {} });
  }
  if (!campus) {
    return res.status(400).json({ status: false, message: 'Invalid or missing campus', data: {} });
  }

  let groupId = null;
  let departmentId = null;
  let departmentName = null;
  let groupName = null;
  let employeeOptions = [];

  // Fetch group_id
  con.query(
    "SELECT group_id FROM duty_group_employee WHERE bio_id = ? AND campus = ?",
    [bioId, campus],
    (err, groupRows) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ status: false, message: 'Error fetching group_id', data: {}, error: err });
      }
      if (groupRows.length > 0) {
        groupId = groupRows[0].group_id;

        // Fetch department_id
        con.query(
          "SELECT department_id FROM emp_ref WHERE bio_id = ? AND campus = ?",
          [bioId, campus],
          (err, departmentRows) => {
            if (err) {
              console.error("Database query error:", err);
              return res.status(500).json({ status: false, message: 'Error fetching department_id', data: {}, error: err });
            }
            if (departmentRows.length > 0) {
              departmentId = departmentRows[0].department_id;

              // Fetch department_name
              con.query(
                "SELECT department_name FROM department WHERE department_id = ? AND campus = ?",
                [departmentId, campus],
                (err, departmentNameRows) => {
                  if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ status: false, message: 'Error fetching department_name', data: {}, error: err });
                  }
                  if (departmentNameRows.length > 0) {
                    departmentName = departmentNameRows[0].department_name;
                  }

                  // Fetch group_name
                  con.query(
                    "SELECT group_name FROM duty_group WHERE group_id = ? AND campus = ?",
                    [groupId, campus],
                    (err, groupNameRows) => {
                      if (err) {
                        console.error("Database query error:", err);
                        return res.status(500).json({ status: false, message: 'Error fetching group_name', data: {}, error: err });
                      }
                      if (groupNameRows.length > 0) {
                        groupName = groupNameRows[0].group_name;
                      }

                      // Fetch employees in the same group except the given bioId
                      con.query(
                        `SELECT de.bio_id, e.employee_name
                         FROM duty_group_employee de
                         JOIN emp_ref e ON de.bio_id = e.bio_id
                         WHERE de.campus = ? AND de.group_id = ?`,
                        [campus, groupId],
                        (err, employeeRows) => {
                          if (err) {
                            console.error("Database query error:", err);
                            return res.status(500).json({ status: false, message: 'Error fetching employees', data: {}, error: err });
                          }

                          // Create an array of objects for employee options
                          employeeOptions = employeeRows
                            .filter(employee => employee.bio_id !== bioId)
                            .map(employee => ({
                              name: employee.employee_name,
                              bioId: employee.bio_id
                            }));

                          // Send the gathered data as response
                          return res.status(200).json({
                            status: true,
                            message: 'Success',
                            data: {
                              groupId,
                              departmentId,
                              departmentName,
                              groupName,
                              employeeOptions // Use the array of objects here
                            }
                          });
                        }
                      );
                    }
                  );
                }
              );
            } else {
              // Handle case where no department_id found
              return res.status(404).json({ status: false, message: 'No department found', data: {} });
            }
          }
        );
      } else {
        // Handle case where no group_id found
        return res.status(404).json({ status: false, message: 'No group found', data: {} });
      }
    }
  );
};

module.exports = getEmployeeOptions;
