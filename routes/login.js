const db = require('../config'); 
const crypto = require('crypto');


function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const loginUser = (req, res) => {

    const { bioId, password } = req.body;

    if (!bioId || !password) {
        return res.status(422).json({
            status: false,
            message: 'Parameter is missing',
            userData: []
        });
    }

    const sql = 'SELECT * FROM emp_ref as e JOIN profileimages p ON e.bio_id = p.bio_id WHERE e.bio_id = ?';

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
            bioId: row.bio_id,
            profileImgUrl : "http://180.235.121.247/uploads/"+row.profileImg
        }))


        const hashedPassword = hashPassword(password);

        if (hashedPassword === user.password) {
            if (user.status.toLowerCase() !== "active") {
                return res.status(401).json({
                    status: false,
                    message: 'Your Account is not Active!',
                    userData: []
                });
            }
            else if (user.director_status.toLowerCase() !== "approved") {
                return res.status(401).json({
                    status: false,
                    message: 'Your Account is not Approved',
                    userData: []
                });
            } 
            else {
                return res.status(200).json({
                    status: true,
                    message: 'Login successful!',
                    userData: userData
                });
            }
        } else {
            return res.status(401).json({
                status: false,
                message: 'Incorrect password',
                userData: []
            });
        }
    });
};

module.exports = loginUser;
