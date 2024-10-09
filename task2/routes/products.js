const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Adjust the path if necessary

// GET route to fetch transactions with search and pagination
router.get('/transactions', async (req, res) => {
  try {
    // Destructure query parameters with defaults
    const { search = '', page = 1, per_page = 10, month } = req.query;

    // Build query for MongoDB
    const query = {};

    // Handle month filter (filter by dateOfSale)
    if (month) {
      const monthNumber = new Date(`${month} 1, 2021`).getMonth(); // Get month index (0 = January)
      const startDate = new Date(2021, monthNumber, 1); // Start of the month
      const endDate = new Date(2021, monthNumber + 1, 1); // Start of the next month

      query.dateOfSale = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    // Handle search parameter for title, description, or price
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: parseFloat(search) } // Handle price search
      ];
    }

    // Pagination logic
    const skip = (page - 1) * per_page;
    const limit = parseInt(per_page);

    // Fetch data from MongoDB
    const products = await Product.find(query).skip(skip).limit(limit);

    // Count documents for pagination metadata
    const totalDocuments = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalDocuments / limit);

    // Send the response with products and pagination details
    res.status(200).json({
      products,
      pagination: {
        totalDocuments,
        totalPages,
        currentPage: parseInt(page),
        perPage: parseInt(per_page)
      }
    });

  } catch (error) {
    // Enhanced error logging to capture details
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Error fetching transactions',
      error: error.message || error // Send detailed error message
    });
  }
});

// Export the router
module.exports = router;
