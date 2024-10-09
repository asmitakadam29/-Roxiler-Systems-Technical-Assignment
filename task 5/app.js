const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Route for Pie Chart Data based on categories for a selected month
app.get('/api/pie-chart', async (req, res) => {
    let { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Please provide a month between January to December' });
    }

    // Normalize the input month (make the first letter uppercase and the rest lowercase)
    month = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    try {
        // Fetch data from the third-party API
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const data = response.data;

        // Define an object to map month names to numbers
        const monthMap = {
            January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
            July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
        };

        // Check if the provided month is valid
        if (!(month in monthMap)) {
            return res.status(400).json({ error: 'Invalid month provided. Please provide a valid month.' });
        }

        const selectedMonth = monthMap[month]; // Convert month name to number (0 for January, etc.)

        // Filter the data for the selected month
        const filteredData = data.filter(item => {
            const saleDate = new Date(item.dateOfSale);
            return saleDate.getMonth() === selectedMonth;
        });

        // Count the number of items in each unique category
        const categoryCounts = filteredData.reduce((acc, item) => {
            const category = item.category; // Assuming there is a 'category' field
            acc[category] = (acc[category] || 0) + 1; // Increment the count for this category
            return acc;
        }, {});

        // Convert the object to an array of { category, count }
        const pieChartData = Object.keys(categoryCounts).map(category => ({
            category,
            count: categoryCounts[category]
        }));

        // Return the category counts
        return res.json(pieChartData);

    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return res.status(500).json({ error: 'Failed to fetch sales data from the third-party API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
