const express = require('express');
const cors = require('cors');
const placesRouter = require('./routes/places');

const app = express();

// Enable CORS for frontend access
app.use(cors());

// Mount API route
app.use('/api/places', placesRouter);

// Root route
app.get('/', (req, res) => {
  res.send('Tourist Guide Platform API');
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});