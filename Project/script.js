const monthSelect = document.getElementById('month-select');
const searchInput = document.getElementById('search');
const transactionsBody = document.getElementById('transactions-body');
const totalSalesBox = document.getElementById('total-sales');
const totalSoldItemsBox = document.getElementById('total-sold-items');
const totalNotSoldItemsBox = document.getElementById('total-not-sold-items');

const barChartCtx = document.getElementById('bar-chart').getContext('2d');
const pieChartCtx = document.getElementById('pie-chart').getContext('2d');

// Fetch statistics
async function fetchStatistics(month) {
  const response = await fetch(`/api/statistics/${month}`);
  return response.json();
}

// Fetch transactions
async function fetchTransactions(month) {
  const response = await fetch(`/api/transactions/${month}`);
  return response.json();
}

// Fetch Bar Chart Data
async function fetchBarChartData(month) {
  const response = await fetch(`/api/bar-chart/${month}`);
  return response.json();
}

// Fetch Pie Chart Data
async function fetchPieChartData(month) {
  const response = await fetch(`/api/pie-chart/${month}`);
  return response.json();
}

// Update Dashboard
async function updateDashboard() {
  const month = monthSelect.value;

  // Update statistics
  const statistics = await fetchStatistics(month);
  totalSalesBox.innerText = `Total Sales: $${statistics.totalSales}`;
  totalSoldItemsBox.innerText = `Total Sold Items: ${statistics.totalSoldItems}`;
  totalNotSoldItemsBox.innerText = `Total Not Sold Items: ${statistics.totalNotSoldItems}`;

  // Update transactions table
  const transactions = await fetchTransactions(month);
  transactionsBody.innerHTML = '';
  transactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.title}</td>
      <td>${transaction.description}</td>
      <td>$${transaction.price}</td>
      <td>${transaction.category}</td>
      <td>${transaction.dateOfSale}</td>
    `;
    transactionsBody.appendChild(row);
  });

  // Update Bar Chart
  const barData = await fetchBarChartData(month);
  const barChartLabels = barData.map(data => data.range);
  const barChartCounts = barData.map(data => data.count);

  new Chart(barChartCtx, {
    type: 'bar',
    data: {
      labels: barChartLabels,
      datasets: [{
        label: 'Number of Items',
        data: barChartCounts,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // Update Pie Chart
  const pieData = await fetchPieChartData(month);
  const pieChartLabels = pieData.map(data => data.category);
  const pieChartCounts = pieData.map(data => data.items);

  new Chart(pieChartCtx, {
    type: 'pie',
    data: {
      labels: pieChartLabels,
      datasets: [{
        label: 'Categories',
        data: pieChartCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Transaction Categories'
        }
      }
    }
  });
}

// Event Listeners
monthSelect.addEventListener('change', updateDashboard);
searchInput.addEventListener('input', async () => {
  const month = monthSelect.value;
  const transactions = await fetchTransactions(month);
  const filteredTransactions = transactions.filter(transaction => {
    const searchText = searchInput.value.toLowerCase();
    return (
      transaction.title.toLowerCase().includes(searchText) ||
      transaction.description.toLowerCase().includes(searchText) ||
      transaction.price.toString().includes(searchText)
    );
  });
  transactionsBody.innerHTML = '';
  filteredTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.title}</td>
      <td>${transaction.description}</td>
      <td>$${transaction.price}</td>
      <td>${transaction.category}</td>
      <td>${transaction.dateOfSale}</td>
    `;
    transactionsBody.appendChild(row);
  });
});

// Initial Dashboard Load
updateDashboard();
