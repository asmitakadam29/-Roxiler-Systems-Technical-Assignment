const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Route for Bar Chart Data based on price ranges for a selected month
app.get('/api/bar-chart', async (req, res) => {
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

        // Define price ranges and initialize counts
        const priceRanges = {
            '0-100': 0,
            '101-200': 0,
            '201-300': 0,
            '301-400': 0,
            '401-500': 0,
            '501-600': 0,
            '601-700': 0,
            '701-800': 0,
            '801-900': 0,
            '901-above': 0
        };

        // Categorize the items based on their price
        filteredData.forEach(item => {
            const price = item.price;

            if (price >= 0 && price <= 100) priceRanges['0-100']++;
            else if (price >= 101 && price <= 200) priceRanges['101-200']++;
            else if (price >= 201 && price <= 300) priceRanges['201-300']++;
            else if (price >= 301 && price <= 400) priceRanges['301-400']++;
            else if (price >= 401 && price <= 500) priceRanges['401-500']++;
            else if (price >= 501 && price <= 600) priceRanges['501-600']++;
            else if (price >= 601 && price <= 700) priceRanges['601-700']++;
            else if (price >= 701 && price <= 800) priceRanges['701-800']++;
            else if (price >= 801 && price <= 900) priceRanges['801-900']++;
            else if (price >= 901) priceRanges['901-above']++;
        });

        // Return the price range data
        return res.json(priceRanges);

    } catch (error) {
        console.error('Error fetching data from API:', error.message);
        return res.status(500).json({ error: 'Failed to fetch sales data from the third-party API' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
