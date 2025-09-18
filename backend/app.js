const express = require('express');
const cors = require('cors');
const placesRoutes = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/places', placesRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('Tourist API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;