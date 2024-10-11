let trades = JSON.parse(localStorage.getItem('trades')) || [];

// Function to update the title with the ticker in neon green
function updateTitle() {
    const ticker = document.getElementById("ticker").value;
    const title = document.getElementById("mainTitle");
    if (ticker) {
        title.innerHTML = `Trading Calculator for <span>${ticker}</span>`;
    } else {
        title.innerHTML = "Trading Calculator";
    }
}

function addTrade() {
    const amount = parseFloat(document.getElementById("amount").value);
    const price = parseFloat(document.getElementById("price").value);
    const fee = parseFloat(document.getElementById("fee").value) / 100;

    trades.push({ amount, price, fee });
    localStorage.setItem('trades', JSON.stringify(trades));
    displayTrades();
    updateCalculations();
}

function displayTrades() {
    const tbody = document.querySelector("#tradesTable tbody");
    tbody.innerHTML = '';
    trades.forEach((trade, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${trade.amount}</td>
            <td>${trade.price}</td>
            <td>${(trade.fee * 100).toFixed(2)}%</td>
            <td><button class="delete-btn" onclick="deleteTrade(${index})">Delete</button></td>
        `;
        tbody.appendChild(row);
    });
}

function deleteTrade(index) {
    trades.splice(index, 1);
    localStorage.setItem('trades', JSON.stringify(trades));
    displayTrades();
    updateCalculations();
}

function updateCalculations() {
    let totalCost = 0, totalAmount = 0, totalFees = 0, totalUSD = 0;

    trades.forEach(trade => {
        totalCost += trade.amount * trade.price;
        totalFees += trade.amount * trade.price * trade.fee;
        totalAmount += trade.amount;
        totalUSD += trade.amount * trade.price;
    });

    const averagePrice = (totalCost + totalFees) / totalAmount;
    document.getElementById("averagePrice").innerText = averagePrice.toFixed(2);
    document.getElementById("totalAmount").innerText = totalAmount.toFixed(2);
    document.getElementById("totalUSD").innerText = totalUSD.toFixed(2); // Display total in USD
}

function calculateProfit() {
    let totalCost = 0, totalAmount = 0, totalFees = 0;

    trades.forEach(trade => {
        totalCost += trade.amount * trade.price;
        totalFees += trade.amount * trade.price * trade.fee;
        totalAmount += trade.amount;
    });

    const averagePrice = (totalCost + totalFees) / totalAmount;
    const calculationType = document.getElementById("calculationType").value;

    if (calculationType === "percentage") {
        const takeProfit = parseFloat(document.getElementById("takeProfit").value) || 0;
        const targetPrice = averagePrice * (1 + takeProfit / 100);
        const profit = (targetPrice * totalAmount) - (totalCost + totalFees);
        document.getElementById("profit").innerText = `Target Price: ${targetPrice.toFixed(2)}, Profit: ${profit.toFixed(2)} USD`;
    } else {
        const targetPrice = parseFloat(document.getElementById("targetPrice").value) || 0;
        const profit = (targetPrice * totalAmount) - (totalCost + totalFees);
        const profitPercentage = ((targetPrice - averagePrice) / averagePrice) * 100;
        document.getElementById("profit").innerText = `Profit: ${profit.toFixed(2)} USD, Profit Percentage: ${profitPercentage.toFixed(2)}%`;
    }
}

function toggleCalculationInputs() {
    const calculationType = document.getElementById("calculationType").value;

    if (calculationType === "percentage") {
        document.getElementById("percentageInput").style.display = "block";
        document.getElementById("targetPriceInput").style.display = "none";
    } else {
        document.getElementById("percentageInput").style.display = "none";
        document.getElementById("targetPriceInput").style.display = "block";
    }
}

function sortTrades(order) {
    trades.sort((a, b) => {
        if (order === 'asc') {
            return a.amount - b.amount;
        } else if (order === 'desc') {
            return b.amount - a.amount;
        }
    });
    localStorage.setItem('trades', JSON.stringify(trades));
    displayTrades();
}

window.onload = function() {
    displayTrades();
    updateCalculations();
};
