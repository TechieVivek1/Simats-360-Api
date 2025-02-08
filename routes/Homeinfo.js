const axios = require('axios');
const FormData = require('form-data');

const homeInfo = async (req, res) => {
    const { bioId, campus, category } = req.body;

    if (!bioId || !campus || !category) {
        return res.status(400).json({
            status: false,
            message: 'bioId, campus, and category are required fields.'
        });
    }

    const form = new FormData();
    form.append('bio_id', bioId);
    form.append('campus', campus);
    form.append('category', category);

    try {
        const response = await axios.post('http://172.21.100.83:8085/simats360/api/emp_attendance_new.php', form, {
            headers: {
                'Cookie': 'PHPSESSID=2i04rf2t7vr73r2cdp0upd16iq',
                ...form.getHeaders()
            }
        });

        return res.status(200).json({
            status: true,
            message: 'Attendance data retrieved successfully.',
            data: response.data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Error making the request: ${error}`
        });
    }
};

module.exports = homeInfo;
