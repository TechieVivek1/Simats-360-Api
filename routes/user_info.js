const con = require('../config');
const empDetails = require('../routes/empDetails');

// Utility function to format months as "X.Y yr/yrs"
const formatExperience = (months) => {
    if (months === 0) {
        return "0 yr"; // Handle zero months explicitly
    }
    const years = months / 12; // Convert months to years
    const formattedYears = years.toFixed(1); // Keep one decimal place
    const wholeYears = Math.floor(years); // Get the integer part of the years
    const suffix = (wholeYears === 0 || wholeYears === 1 || wholeYears === 2) ? "yr" : "yrs"; // Singular for 0 and 1
    return `${formattedYears} ${suffix}`;
};


const userInfo = async (req, res) => {
    const { bio_id, campus } = req.body;

    if (!bio_id) {
        return res.status(400).json({ message: 'bio_id is required' });
    }
    if (!campus) {
        return res.status(400).json({ message: 'campus is required' });
    }

    const query = `
        SELECT 
            ed.internal_experience, 
            ed.external_experience, 
            e.campus, 
            e.employee_name, 
            e.category, 
            DATE_FORMAT(e.dob, '%Y-%m-%d') AS dob, 
            DATE_FORMAT(e.doj, '%Y-%m-%d') AS doj, 
            e.phone, 
            e.email, 
            e.address, 
            CONCAT('http://180.235.121.247/uploads/', p.profileImg) AS profileImageURL, 
            e.bio_id, 
            e.staff_id, 
            e.designation_id, 
            d.designation_name 
        FROM emp_ref e 
        JOIN profileimages p ON e.bio_id = p.bio_id 
        JOIN designation d ON e.designation_id = d.designation_id 
        JOIN employee_details ed ON e.bio_id = ed.bio_id 
        WHERE e.bio_id = ?;
    `;

    con.query(query, [bio_id], async (err, results, fields) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching user info', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract internal and external experience from results
        const result = results[0]; // Assuming only one record per bio_id
        const internalExperienceFormatted = formatExperience(result.internal_experience || 0);
        const externalExperienceFormatted = formatExperience(result.external_experience || 0);

        // Append formatted experience to the result
        result.internal_experience = internalExperienceFormatted;
        result.external_experience = externalExperienceFormatted;

        // Fetch additional details
        let empDetailsResultData = {};
        let empDetailsResult = await empDetails(campus, bio_id);

        return res.status(200).json({
            status: 200,
            message: 'User info fetched successfully',
            data: result,
        });
    });
};

module.exports = userInfo;
