const db = require('../config'); 
const crypto = require('crypto');


function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const loginUser = (req, res) => {

    const { bioId, password } = req.body;


    console.log(`Body -----`, req.body);


    if (!bioId || !password) {
        return res.status(422).json({
            status: false,
            message: 'Parameter is missing',
            userData: []
        });
    }


    const sql = 'SELECT * FROM emp_ref WHERE bio_id = ?';


    db.query(sql, [bioId], (err, results) => {

        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ status: false, message: 'Internal server error', userData: results });
        }

        if (results.length === 0) {
            return res.status(401).json({
                status: false,
                message: 'BioID not found',
                userData: results
            });
        }

        const user = results[0]; 
        console.log

        const userData = results.map(row => ({
            campus: row.campus,
            category: row.category,
            bioId: row.bio_id
        }))


        // Hash the provided password
        const hashedPassword = hashPassword(password);

        // Check if the hashed password matches the user's stored password
        if (hashedPassword === user.password) {
            // Check if the user account is active
            if (user.status.toLowerCase() !== "active") {
                return res.status(401).json({
                    status: false,
                    message: 'Your Account is not Active!',
                    userData: []
                });
            }
            // Check if the user's account is approved
            else if (user.director_status.toLowerCase() !== "approved") {
                return res.status(401).json({
                    status: false,
                    message: 'Your Account is not Approved',
                    userData: []
                });
            } 
            // Successful login
            else {
                return res.status(200).json({
                    status: true,
                    message: 'Login successful!',
                    userData: userData
                });
            }
        } else {
            // Incorrect password
            return res.status(401).json({
                status: false,
                message: 'Incorrect password',
                userData: []
            });
        }
    });
};

module.exports = loginUser;
