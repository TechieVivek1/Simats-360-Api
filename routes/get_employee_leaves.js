const con = require('../config');

const leaveInfo = async (req, res) => {
    const { category, campus, bio_id } = req.body;

    if (!bio_id || !category || !campus) {
        return res.status(400).json({ status: false, message: 'Empty Fields', data: {} });
    }

    const query = `SELECT * FROM available_leave WHERE bio_id = ? AND campus = ? AND category = ?`;

    con.query(query, [bio_id, campus, category], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ status: false, message: 'Error fetching user info', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ status: false, message: 'No Data Found', data: {} });
        }

        const excludedFields = ['id', 'campus', 'category', 'designation', 'bioId'];
        const transformKey = (key) => {
            return key
                .replace(/_limit$/, '')
                .replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        };

        const row = results[0];
        const dynamicData = {};
        for (const [key, value] of Object.entries(row)) {
            const camelKey = transformKey(key);
            if (!excludedFields.includes(camelKey)) {
                dynamicData[camelKey] = value;
            }
        }

        return res.status(200).json({
            status: true,
            message: 'Success',
            data: dynamicData,
        });
    });
};

module.exports = leaveInfo;
