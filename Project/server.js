const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_SOURCE_URL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';

// Function to fetch data from the external API
async function fetchData() {
    const response = await axios.get(DATA_SOURCE_URL);
    return response.data;
}

// API to get statistics
app.get('/api/statistics/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const data = await fetchData();

    let totalSales = 0;
    let totalSoldItems = 0;
    let totalNotSoldItems = 0;

    data.forEach(transaction => {
        const date = new Date(transaction.dateOfSale);
        if (date.getMonth() === month - 1) {
            totalSales += transaction.price;
            totalSoldItems += 1;
        } else {
            totalNotSoldItems += 1; // Assuming not sold items are those not matching the month
        }
    });

    res.json({ totalSales, totalSoldItems, totalNotSoldItems });
});

// API to get transactions for a specific month
app.get('/api/transactions/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const data = await fetchData();

    const transactions = data.filter(transaction => {
        const date = new Date(transaction.dateOfSale);
        return date.getMonth() === month - 1;
    });

    res.json(transactions);
});

// API for bar chart data
app.get('/api/bar-chart/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const data = await fetchData();

    const priceRanges = {
        '0 - 100': 0,
        '101 - 200': 0,
        '201 - 300': 0,
        '301 - 400': 0,
        '401 - 500': 0,
        '501 - 600': 0,
        '601 - 700': 0,
        '701 - 800': 0,
        '801 - 900': 0,
        '901 - above': 0
    };

    data.forEach(transaction => {
        const date = new Date(transaction.dateOfSale);
        if (date.getMonth() === month - 1) {
            const price = transaction.price;
            if (price <= 100) priceRanges['0 - 100']++;
            else if (price <= 200) priceRanges['101 - 200']++;
            else if (price <= 300) priceRanges['201 - 300']++;
            else if (price <= 400) priceRanges['301 - 400']++;
            else if (price <= 500) priceRanges['401 - 500']++;
            else if (price <= 600) priceRanges['501 - 600']++;
            else if (price <= 700) priceRanges['601 - 700']++;
            else if (price <= 800) priceRanges['701 - 800']++;
            else if (price <= 900) priceRanges['801 - 900']++;
            else priceRanges['901 - above']++;
        }
    });

    res.json(priceRanges);
});

// API for pie chart data
app.get('/api/pie-chart/:month', async (req, res) => {
    const month = parseInt(req.params.month, 10);
    const data = await fetchData();

    const categoryCount = {};

    data.forEach(transaction => {
        const date = new Date(transaction.dateOfSale);
        if (date.getMonth() === month - 1) {
            categoryCount[transaction.category] = (categoryCount[transaction.category] || 0) + 1;
        }
    });

    res.json(categoryCount);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
