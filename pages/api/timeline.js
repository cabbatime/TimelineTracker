const { put, get, del } = require('@vercel/blob');
require('dotenv').config();

const handler = async (req, res) => {
    console.log('API route accessed');
    console.log(`Received request: ${req.method}`);
    console.log('Request body:', req.body);
    console.log('Request query:', req.query);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.setHeader('Content-Type', 'application/json');

    try {
        if (req.method === 'GET') {
            const { userId } = req.query;
            console.log(`GET request for userId: ${userId}`);

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            try {
                const { blob } = await get(`timelinetracker-${userId}.json`, {
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                const data = await blob.json();
                console.log('Data retrieved successfully');
                return res.status(200).json(data);
            } catch (error) {
                console.error('Error retrieving data:', error);
                if (error.status === 404) {
                    return res.status(404).json({ error: 'Data not found' });
                }
                return res.status(500).json({ error: 'Failed to retrieve data' });
            }
        } else if (req.method === 'POST') {
            console.log('Handling POST request');
            const { userId, data } = req.body;
            console.log(`POST request for userId: ${userId}`);

            if (!userId || !data) {
                return res.status(400).json({ error: 'userId and data are required' });
            }

            try {
                const { url } = await put(`timelinetracker-${userId}.json`, JSON.stringify(data), {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                console.log('Data saved successfully');
                return res.status(200).json({ success: true, url });
            } catch (error) {
                console.error('Error saving data:', error);
                return res.status(500).json({ error: 'Failed to save data' });
            }
        } else if (req.method === 'DELETE') {
            const { userId } = req.query;
            console.log(`DELETE request for userId: ${userId}`);

            if (!userId) {
                return res.status(400).json({ error: 'userId is required' });
            }

            try {
                await del(`timelinetracker-${userId}.json`, {
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                console.log('Data deleted successfully');
                return res.status(200).json({ success: true });
            } catch (error) {
                console.error('Error deleting data:', error);
                return res.status(500).json({ error: 'Failed to delete data' });
            }
        } else {
            console.log(`Method ${req.method} not allowed`);
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
};

module.exports = handler;