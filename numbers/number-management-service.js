const express = require('express');
const axios = require('axios');
const https = require('https');

const app = express();
const PORT = 8008;

app.get('/numbers', async (req, res) => {
    const urls = req.query.url;

    if (!urls) {
        return res.status(400).json({ error: 'No URLs provided in query parameters.' });
    }

    const agent = new https.Agent({
        rejectUnauthorized: false, // Allow self-signed certificates
    });

    const responseDataArrays = await Promise.all(
        urls.map(async (url) => {
            try {
                const response = await axios.get(url, { httpsAgent: agent });
                return response.data.numbers || [];
            } catch (error) {
                console.error(`Error fetching data from URL ${url}:`, error.message);
                return [];
            }
        })
    );

    const mergedNumbers = [].concat(...responseDataArrays);
    mergedNumbers.sort((a, b) => a - b);
    const uniqueNumbers = mergedNumbers.filter((value, index) => index === 0 || value !== mergedNumbers[index - 1]);

    return res.json({ numbers: uniqueNumbers });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
