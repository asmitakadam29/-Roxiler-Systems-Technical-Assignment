const express = require('express');
const mongoose = require('mongoose');
const seedRoutes = require('./routes/Seed');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/productsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error connecting to MongoDB:', err);
});

// Middleware
app.use(express.json());

// Seed route
app.use('/api', seedRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
