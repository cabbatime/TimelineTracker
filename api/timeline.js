import { put, get, del } from '@vercel/blob';

export default async function handler(req, res) {
    console.log('API route accessed');
    console.log(`Received request method: ${req.method}`);
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request query:', JSON.stringify(req.query, null, 2));

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        console.log('Handling OPTIONS request');
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const { userId } = req.query;
            console.log(`GET request for userId: ${userId}`);

            if (!userId) {
                console.log('Bad request: userId is missing');
                return res.status(400).json({ error: 'userId is required' });
            }

            try {
                const { blob } = await get(`timelinetracker-${userId}.json`, {
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                const data = await blob.text();
                const jsonData = JSON.parse(data);
                console.log('Data retrieved successfully');
                return res.status(200).json(jsonData);
            } catch (error) {
                console.error('Error retrieving data:', error);
                if (error.status === 404) {
                    return res.status(404).json({ error: 'Data not found' });
                }
                return res.status(500).json({ error: 'Failed to retrieve data', details: error.message });
            }
        } else if (req.method === 'POST') {
            console.log('Handling POST request');
            const { userId, data } = req.body;
            console.log(`POST request for userId: ${userId}`);
            console.log('POST data:', JSON.stringify(data, null, 2));

            if (!userId || !data) {
                console.log('Bad request: userId or data missing');
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
                return res.status(500).json({ error: 'Failed to save data', details: error.message });
            }
        } else if (req.method === 'DELETE') {
            const { userId } = req.query;
            console.log(`DELETE request for userId: ${userId}`);

            if (!userId) {
                console.log('Bad request: userId is missing');
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
                return res.status(500).json({ error: 'Failed to delete data', details: error.message });
            }
        } else {
            console.log(`Method ${req.method} not allowed`);
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
}