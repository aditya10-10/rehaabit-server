const axios = require('axios');

exports.getLocationSuggestions = async (req, res) => {
    const { query } = req.query;
    const location = '28.61,77.23'; // Default location (can be dynamic)
    const token = process.env.MAPMYINDIA_ACCESS_TOKEN;

    // console.log('Query:', query);
    // console.log('Location:', location);
    // console.log('Token:', token);

    try {
        const response = await axios.get(
            'https://atlas.mapmyindia.com/api/places/search/json',
            {
                params: {
                    query,
                    location,
                    region: 'IND',
                    tokenizeAddress: false,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        // console.log('Response:', response.data);
        res.json(response.data);
    } catch (error) {
        // console.error('Error fetching location suggestions:', error);
        res.status(500).json({ error: 'An error occurred while fetching location suggestions' });
    }
};
