const fetch = require('isomorphic-fetch');

module.exports = async function handler(req, res) {
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

    const blobApiUrl = 'https://blob.vercel-storage.com';
    const metadataUrl = `${blobApiUrl}/timelinetracker-metadata.json`;
    let metadata = {};

    // Fetch the current metadata
    try {
        const metadataResponse = await fetch(metadataUrl, {
            headers: {
                'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
            }
        });

        if (metadataResponse.ok) {
            metadata = await metadataResponse.json();
            console.log('Metadata loaded:', metadata);
        } else {
            console.log('Metadata not found or cannot be accessed, starting with empty metadata.');
        }
    } catch (error) {
        console.error('Error fetching metadata:', error);
    }

    try {
        if (req.method === 'GET') {
            const { userId } = req.query;
            console.log(`GET request for userId: ${userId}`);

            if (!userId) {
                console.log('Bad request: userId is missing');
                return res.status(400).json({ error: 'userId is required' });
            }

            const fileUrl = metadata[userId];
            if (!fileUrl) {
                console.log('File URL not found in metadata');
                return res.status(404).json({ error: 'Data not found' });
            }

            try {
                const response = await fetch(fileUrl, {
                    headers: {
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
                    }
                });

                console.log(`Fetch response status: ${response.status}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        console.log('Data not found');
                        return res.status(404).json({ error: 'Data not found', url: fileUrl });
                    }
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const data = await response.json();
                console.log('Data retrieved successfully');
                return res.status(200).json(data);
            } catch (error) {
                console.error('Error retrieving data:', error);
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
                const fileUrl = `${blobApiUrl}/timelinetracker-${userId}.json`;
                console.log(`Saving data to URL: ${fileUrl}`);

                const response = await fetch(fileUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
                        'x-vercel-storage-access': 'public'
                    },
                    body: JSON.stringify(data)
                });

                console.log(`POST response status: ${response.status}`);

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('Error response body:', errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
                }

                const result = await response.json();
                console.log('Data saved successfully');

                // Update metadata with the new file URL
                metadata[userId] = result.url;

                // Save updated metadata
                const metadataSaveResponse = await fetch(metadataUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
                        'x-vercel-storage-access': 'public'
                    },
                    body: JSON.stringify(metadata)
                });

                if (!metadataSaveResponse.ok) {
                    const errorBody = await metadataSaveResponse.text();
                    console.error('Error updating metadata:', errorBody);
                    throw new Error(`HTTP error! status: ${metadataSaveResponse.status}, body: ${errorBody}`);
                }

                return res.status(200).json({ success: true, url: result.url, fullResponse: result });
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

            const fileUrl = metadata[userId];
            if (!fileUrl) {
                console.log('File URL not found in metadata');
                return res.status(404).json({ error: 'Data not found' });
            }

            try {
                const response = await fetch(fileUrl, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
                    }
                });

                console.log(`DELETE response status: ${response.status}`);

                if (!response.ok) {
                    const errorBody = await response.text();
                    console.error('Error response body:', errorBody);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
                }

                // Remove user data from metadata
                delete metadata[userId];

                // Save updated metadata
                const metadataSaveResponse = await fetch(metadataUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
                        'x-vercel-storage-access': 'public'
                    },
                    body: JSON.stringify(metadata)
                });

                if (!metadataSaveResponse.ok) {
                    const errorBody = await metadataSaveResponse.text();
                    console.error('Error updating metadata:', errorBody);
                    throw new Error(`HTTP error! status: ${metadataSaveResponse.status}, body: ${errorBody}`);
                }

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
};
