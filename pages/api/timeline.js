import { put, get, del } from '@vercel/blob';

export default async function handler(req, res) {
  console.log(`Received ${req.method} request`);

  try {
    if (req.method === 'GET') {
      const { userId } = req.query;
      console.log(`GET request for userId: ${userId}`);

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      try {
        const { blob } = await get(`timelinetracker-${userId}.json`);
        const data = await blob.json();
        console.log('Data retrieved successfully');
        return res.status(200).json(data);
      } catch (error) {
        console.error('Error retrieving data:', error);
        return res.status(404).json({ error: 'Data not found' });
      }
    } else if (req.method === 'POST') {
      const { userId, data } = req.body;
      console.log(`POST request for userId: ${userId}`);

      if (!userId || !data) {
        return res.status(400).json({ error: 'userId and data are required' });
      }

      try {
        const { url } = await put(`timelinetracker-${userId}.json`, JSON.stringify(data), {
          access: 'public',
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
        await del(`timelinetracker-${userId}.json`);
        console.log('Data deleted successfully');
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error deleting data:', error);
        return res.status(500).json({ error: 'Failed to delete data' });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}