const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');

const router = express.Router();

// API route to fetch data and seed the database
router.get('/seed-database', async (req, res) => {
  try {
    // Fetch data from third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    let products = response.data;

    // Process data to ensure all required fields exist
    products = products.map(product => {
      // Ensure rating fields exist
      product.rating = product.rating || {};
      product.rating.rate = product.rating.rate || 0;
      product.rating.count = product.rating.count || 0;

      return product;
    });

    // Clear existing products to avoid duplicates
    await Product.deleteMany({});

    // Insert fetched products into the database
    await Product.insertMany(products);

    res.status(200).json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error seeding database', error });
  }
});

module.exports = router;
