const express = require('express');
const handler = require('./pages/api/timeline'); // Adjust the path as necessary
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/timeline', handler);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
