const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Function to fetch data from the third-party API
async function fetchData() {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    return response.data;
}

// Helper function to get month number from month name
function getMonthNumber(month) {
    const monthMap = {
        January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
        July: 6, August: 7, September: 8, October: 9, November: 10, December: 11
    };
    return monthMap[month];
}

// API Route for Total Sales Statistics
app.get('/api/statistics', async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Please provide a month between January to December' });
    }

    const monthNumber = getMonthNumber(month);

    if (monthNumber === undefined) {
        return res.status(400).json({ error: 'Invalid month provided. Please provide a valid month.' });
    }

    try {
        const data = await fetchData();

        const filteredData = data.filter(item => new Date(item.dateOfSale).getMonth() === monthNumber);

        const totalSaleAmount = filteredData.reduce((total, item) => item.sold ? total + item.price : total, 0);
        const totalSoldItems = filteredData.filter(item => item.sold).length;
        const totalUnsoldItems = filteredData.filter(item => !item.sold).length;

        return res.json({
            totalSaleAmount,
            totalSoldItems,
            totalUnsoldItems,
        });

    } catch (error) {
        console.error('Error fetching statistics:', error);
        return res.status(500).json({ error: 'Failed to fetch sales statistics' });
    }
});

// API Route for Bar Chart Data
app.get('/api/bar-chart', async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Please provide a month between January to December' });
    }

    const monthNumber = getMonthNumber(month);

    if (monthNumber === undefined) {
        return res.status(400).json({ error: 'Invalid month provided. Please provide a valid month.' });
    }

    try {
        const data = await fetchData();

        const filteredData = data.filter(item => new Date(item.dateOfSale).getMonth() === monthNumber);

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

        filteredData.forEach(item => {
            if (item.sold) {
                const price = item.price;
                if (price <= 100) priceRanges['0-100']++;
                else if (price <= 200) priceRanges['101-200']++;
                else if (price <= 300) priceRanges['201-300']++;
                else if (price <= 400) priceRanges['301-400']++;
                else if (price <= 500) priceRanges['401-500']++;
                else if (price <= 600) priceRanges['501-600']++;
                else if (price <= 700) priceRanges['601-700']++;
                else if (price <= 800) priceRanges['701-800']++;
                else if (price <= 900) priceRanges['801-900']++;
                else priceRanges['901-above']++;
            }
        });

        return res.json(priceRanges);

    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        return res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
});

// API Route for Pie Chart Data
app.get('/api/pie-chart', async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Please provide a month between January to December' });
    }

    const monthNumber = getMonthNumber(month);

    if (monthNumber === undefined) {
        return res.status(400).json({ error: 'Invalid month provided. Please provide a valid month.' });
    }

    try {
        const data = await fetchData();

        const filteredData = data.filter(item => new Date(item.dateOfSale).getMonth() === monthNumber);

        const categoryCounts = filteredData.reduce((acc, item) => {
            const category = item.category; // Assuming there's a 'category' field
            acc[category] = (acc[category] || 0) + 1; // Increment the count for this category
            return acc;
        }, {});

        const pieChartData = Object.keys(categoryCounts).map(category => ({
            category,
            count: categoryCounts[category]
        }));

        return res.json(pieChartData);

    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        return res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
});

// Combined API Route
app.get('/api/combined', async (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: 'Please provide a month between January to December' });
    }

    const monthNumber = getMonthNumber(month);

    if (monthNumber === undefined) {
        return res.status(400).json({ error: 'Invalid month provided. Please provide a valid month.' });
    }

    try {
        const [statistics, barChartData, pieChartData] = await Promise.all([
            axios.get(`http://localhost:${PORT}/api/statistics?month=${month}`),
            axios.get(`http://localhost:${PORT}/api/bar-chart?month=${month}`),
            axios.get(`http://localhost:${PORT}/api/pie-chart?month=${month}`)
        ]);

        return res.json({
            statistics: statistics.data,
            barChartData: barChartData.data,
            pieChartData: pieChartData.data
        });

    } catch (error) {
        console.error('Error fetching combined data:', error);
        return res.status(500).json({ error: 'Failed to fetch combined data' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
