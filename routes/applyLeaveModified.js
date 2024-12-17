const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require("../config"); 

const demoFileDir = path.join(__dirname, "uploads");

const ensureDirectoryExistence = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};
ensureDirectoryExistence(demoFileDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, demoFileDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${req.body.bioId}_${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage });

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

// const applyLeaveModified = async (req, res) => {
//   const uploadMiddleware = upload.single("file");

//   uploadMiddleware(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ status: false, message: err.message });
//     }

//     // Extracting input fields
//     let {
//       campus,
//       bioId,
//       leaveCategory,
//       leaveType,
//       daySession,
//       startDate,
//       reason,
//       headId,
//     } = req.body;
//     let file = req.file ? req.file.filename : null;
//     let endDate = "0000-00-00"; // Default value for endDate

//     // Input validation
//     if (
//       !bioId ||
//       !campus ||
//       !leaveCategory ||
//       !leaveType ||
//       !startDate ||
//       !reason
//     ) {
//       return res
//         .status(400)
//         .json({ status: false, message: "Missing required fields" });
//     }

//     if(leaveCategory.toLowerCase() === "od"){
      

//     }else{

//     try {
//       // Start transaction
//       await query("START TRANSACTION");

//       // Fetch probation status
//       const probationResult = await query(
//         `SELECT probation_status, extend_probation_status 
//                  FROM probation_notice_period 
//                  WHERE campus = ? AND bio_id = ?`,
//         [campus, bioId]
//       );
//       const probation = probationResult[0];
//       if (
//         probation?.probation_status === "Pending" ||
//         probation?.extend_probation_status === "Pending"
//       ) {
//         return res.status(403).json({
//           status: false,
//           message: "Cannot apply for leave during pending probation",
//         });
//       }

//       // Fetch leave category limits
//       const categoryResult = await query(
//         `SELECT duringprobation, minimalpreleavebuffer, maximalpostprocessbuffer, minimalexperience, avail_per_month 
//                  FROM add_leave_category 
//                  WHERE campus = ? AND leave_name = ?`,
//         [campus, leaveCategory]
//       );
//       const categoryLimits = categoryResult[0];
//       if (!categoryLimits) {
//         return res.status(404).json({
//           status: false,
//           message: `Leave category '${leaveCategory}' not found`,
//         });
//       }

//       // Check minimum experience
//       const dojResult = await query(
//         `SELECT doj FROM emp_ref WHERE campus = ? AND bio_id = ?`,
//         [campus, bioId]
//       );
//       const doj = new Date(dojResult[0]?.doj);
//       const today = new Date();
//       const experienceDays = Math.floor((today - doj) / (1000 * 60 * 60 * 24));
//       if (experienceDays < categoryLimits.minimalexperience) {
//         return res.status(403).json({
//           status: false,
//           message: "Minimal experience requirement not met",
//         });
//       }

//       const currentDateTime = new Date();
//       const currentDate = new Date(currentDateTime.toISOString().split("T")[0]);
//       const startDateOnly = new Date(startDate);

//       const endOfStartDate = new Date(startDateOnly);
//       endOfStartDate.setHours(23, 59, 59, 999);

//       if (leaveCategory.toLowerCase() === "earned leave" || leaveCategory.toLowerCase() === "vacation leave" || leaveCategory.toLowerCase() === "academic leave") {

//         if (categoryLimits.minimalpreleavebuffer > 0) {
//           // Check minimal pre-buffer time
//           const minPreLeaveTime = new Date(
//             startDateOnly.getTime() -
//               categoryLimits.minimalpreleavebuffer * 60 * 60 * 1000
//           );
//           if (currentDateTime > minPreLeaveTime) {
//             return res.status(403).json({
//               status: false,
//               message: `You need to apply at least ${categoryLimits.minimalpreleavebuffer} hours before.`,
//             });
//           }
//         }

//       } else if (startDateOnly < currentDate) {
//         // General Leave: Check post-buffer time
//         const bufferHours = Number(categoryLimits.maximalpostprocessbuffer);
//         const maxPostTime = new Date(
//           endOfStartDate.getTime() + bufferHours * 60 * 60 * 1000
//         );

//         if (currentDateTime > maxPostTime) {
//           return res.status(403).json({
//             status: false,
//             message: `You can apply for past leave within ${bufferHours} hours only.`,
//           });
//         }
//       } else if (categoryLimits.minimalpreleavebuffer > 0) {
//         // Check minimal pre-buffer time
//         const minPreLeaveTime = new Date(
//           startDateOnly.getTime() -
//             categoryLimits.minimalpreleavebuffer * 60 * 60 * 1000
//         );
//         if (currentDateTime > minPreLeaveTime) {
//           return res.status(403).json({
//             status: false,
//             message: `You need to apply at least ${categoryLimits.minimalpreleavebuffer} hours before.`,
//           });
//         }
//       }

//       const formattedCategory =
//         leaveCategory.toLowerCase().replace(" ", "_") + "_limit";
//       const availableLeaveResult = await query(
//         `SELECT ${formattedCategory} FROM available_leave WHERE campus = ? AND bio_id = ?`,
//         [campus, bioId]
//       );
//       const availableLimit = availableLeaveResult[0]?.[formattedCategory] || 0;

//       const totalDays = leaveType === "half_day" ? 0.5 : 1;
    
//       if(leaveType === "full_day"){
//         daySession = null
//       }

//       if (totalDays > availableLimit) {
//         return res.status(403).json({
//           status: false,
//           message: "Insufficient leave balance",
//         });
//       }

//       const overlapResult = await query(
//         `SELECT COUNT(*) as count 
//                  FROM apply_leave 
//                  WHERE bio_id = ? AND campus = ? AND status != 'Rejected' AND start_date = ?`,
//         [bioId, campus, startDate]
//       );
//       if (overlapResult[0].count > 0) {
//         return res.status(409).json({
//           status: false,
//           message: "Leave application already exist for this date.",
//         });
//       }

//       const insertQuery = `
//                 INSERT INTO apply_leave 
//                 (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status) 
//                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
//             `;
//       await query(insertQuery, [
//         bioId,
//         leaveCategory,
//         leaveType,
//         daySession,
//         startDate,
//         endDate,
//         totalDays,
//         reason,
//         file ? `uploads/${file}` : null,
//         campus,
//         headId,
//       ]);

//       await query("COMMIT");
//       res.status(200).json({
//         status: true,
//         message: "Leave Applied Successfully",
//       });
//     } catch (error) {
//       // Rollback on error
//       await query("ROLLBACK");
//       res.status(500).json({
//         status: false,
//         message: "Error inserting data into `apply_leave`",
//         error: error.message,
//       });
//     }

//   }

//   });
// };

const applyLeaveModified = async (req, res) => {
  const uploadMiddleware = upload.single("file");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    let {
      campus,
      bioId,
      leaveCategory,
      leaveType,
      daySession,  
      startDate,
      reason,
      headId,
    } = req.body;
    let file = req.file ? req.file.filename : null;
    let endDate = "0000-00-00"; 

    if (
      !bioId ||
      !campus ||
      !leaveCategory ||
      !leaveType ||
      !startDate ||
      !reason
    ) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    if (leaveCategory.toLowerCase() === "off") {
      try {
        await query("START TRANSACTION");

        let totalDays = 0;
        if (leaveType.toLowerCase() === "half_day") {
          totalDays = 0.5; 
        } else {
          totalDays = 1; 
        }

        const overlapResult = await query(
          `SELECT COUNT(*) as count 
           FROM apply_leave 
           WHERE bio_id = ? AND campus = ? AND status != 'Rejected' AND start_date = ?`,
          [bioId, campus, startDate]
        );
        if (overlapResult[0].count > 0) {
          return res.status(409).json({
            status: false,
            message: "Leave application already exist for this date.",
          });
        }

        const insertQuery = `
          INSERT INTO apply_leave 
          (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;
        await query(insertQuery, [
          bioId,
          leaveCategory,
          leaveType,
          daySession,
          startDate,
          endDate,
          totalDays,
          reason,
          file ? `uploads/${file}` : null,
          campus,
          headId,
        ]);

        await query("COMMIT");
        res.status(200).json({
          status: true,
          message: "comboff Applied Successfully",
        });
      } catch (error) {

        await query("ROLLBACK");
        res.status(500).json({
          status: false,
          message: "Error applying leave for comboff"
        });
      }
    } else if (leaveCategory.toLowerCase() === "od") {
      try {
        await query("START TRANSACTION");

        let totalDays = 0;
        if (leaveType.toLowerCase() === "half_day") {
          totalDays = 0.5; 
        } else {
          totalDays = 1; 
        }

        const overlapResult = await query(
          `SELECT COUNT(*) as count 
           FROM apply_leave 
           WHERE bio_id = ? AND campus = ? AND status != 'Rejected' AND start_date = ?`,
          [bioId, campus, startDate]
        );
        if (overlapResult[0].count > 0) {
          return res.status(409).json({
            status: false,
            message: "Leave application already exist for this date.",
          });
        }

        const insertQuery = `
          INSERT INTO apply_leave 
          (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;
        await query(insertQuery, [
          bioId,
          leaveCategory,
          leaveType,
          daySession,
          startDate,
          endDate,
          totalDays,
          reason,
          file ? `uploads/${file}` : null,
          campus,
          headId,
        ]);

        await query("COMMIT");
        res.status(200).json({
          status: true,
          message: "OD Applied Successfully",
        });
      } catch (error) {

        await query("ROLLBACK");
        res.status(500).json({
          status: false,
          message: "Error applying leave for OD"
        });
      }
    } else {
      try {
        await query("START TRANSACTION");

        const probationResult = await query(
          `SELECT probation_status, extend_probation_status 
           FROM probation_notice_period 
           WHERE campus = ? AND bio_id = ?`,
          [campus, bioId]
        );
        const probation = probationResult[0];
        if (
          probation?.probation_status === "Pending" ||
          probation?.extend_probation_status === "Pending"
        ) {
          return res.status(403).json({
            status: false,
            message: "Cannot apply for leave during pending probation",
          });
        }

        // Fetch leave category limits
        const categoryResult = await query(
          `SELECT duringprobation, minimalpreleavebuffer, maximalpostprocessbuffer, minimalexperience, avail_per_month 
           FROM add_leave_category 
           WHERE campus = ? AND leave_name = ?`,
          [campus, leaveCategory]
        );
        const categoryLimits = categoryResult[0];
        if (!categoryLimits) {
          return res.status(404).json({
            status: false,
            message: `Leave category '${leaveCategory}' not found`,
          });
        }

        // Check minimum experience
        const dojResult = await query(
          `SELECT doj FROM emp_ref WHERE campus = ? AND bio_id = ?`,
          [campus, bioId]
        );
        const doj = new Date(dojResult[0]?.doj);
        const today = new Date();
        const experienceDays = Math.floor((today - doj) / (1000 * 60 * 60 * 24));
        if (experienceDays < categoryLimits.minimalexperience) {
          return res.status(403).json({
            status: false,
            message: "Minimal experience requirement not met",
          });
        }

        const currentDateTime = new Date();
        const currentDate = new Date(currentDateTime.toISOString().split("T")[0]);
        const startDateOnly = new Date(startDate);

        const endOfStartDate = new Date(startDateOnly);
        endOfStartDate.setHours(23, 59, 59, 999);

        if (leaveCategory.toLowerCase() === "earned leave" || leaveCategory.toLowerCase() === "vacation leave" || leaveCategory.toLowerCase() === "academic leave") {
          if (categoryLimits.minimalpreleavebuffer > 0) {
             const minPreLeaveTime = new Date(
              startDateOnly.getTime() - categoryLimits.minimalpreleavebuffer * 60 * 60 * 1000
            );
            if (currentDateTime > minPreLeaveTime) {
              return res.status(403).json({
                status: false,
                message: `You need to apply at least ${categoryLimits.minimalpreleavebuffer} hours before.`,
              });
            }
          }
        } else if (startDateOnly < currentDate) {
          const bufferHours = Number(categoryLimits.maximalpostprocessbuffer);
          const maxPostTime = new Date(
            endOfStartDate.getTime() + bufferHours * 60 * 60 * 1000
          );

          if (currentDateTime > maxPostTime) {
            return res.status(403).json({
              status: false,
              message: `You can apply for past leave within ${bufferHours} hours only.`,
            });
          }
        }

        const formattedCategory =
          leaveCategory.toLowerCase().replace(" ", "_") + "_limit";
        const availableLeaveResult = await query(
          `SELECT ${formattedCategory} FROM available_leave WHERE campus = ? AND bio_id = ?`,
          [campus, bioId]
        );
        const availableLimit = availableLeaveResult[0]?.[formattedCategory] || 0;

        const totalDays = leaveType === "half_day" ? 0.5 : 1;

        if (totalDays > availableLimit) {
          return res.status(403).json({
            status: false,
            message: "Insufficient leave balance",
          });
        }

        const overlapResult = await query(
          `SELECT COUNT(*) as count 
           FROM apply_leave 
           WHERE bio_id = ? AND campus = ? AND status != 'Rejected' AND start_date = ?`,
          [bioId, campus, startDate]
        );
        if (overlapResult[0].count > 0) {
          return res.status(409).json({
            status: false,
            message: "Leave application already exist for this date.",
          });
        }

        if (leaveType === "half_day") {
          endDate = startDate;
        } else {
          endDate = startDate;
        }

        const insertQuery = `
          INSERT INTO apply_leave 
          (bio_id, category, leave_type, half_day_session, start_date, end_date, total_days, reason, file, campus, assigned_head_id, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        `;
        await query(insertQuery, [
          bioId,
          leaveCategory,
          leaveType,
          daySession,
          startDate,
          endDate,
          totalDays,
          reason,
          file ? `uploads/${file}` : null,
          campus,
          headId,
        ]);

        await query("COMMIT");
        res.status(200).json({
          status: true,
          message: "Leave Applied Successfully",
        });
      } catch (error) {
        await query("ROLLBACK");
        res.status(500).json({
          status: false,
          message: "Error while applying leave"
        });
      }
    }
  });
};

module.exports = {
  applyLeaveModified,
};


module.exports = applyLeaveModified;
