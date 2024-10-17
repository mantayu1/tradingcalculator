"use strict";

// Utility function to generate unique IDs
function generateUniqueId() {
    return 'calc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Retrieve calculators from localStorage or initialize an empty array
let calculators = [];

// Function to save calculators to localStorage
function saveCalculators() {
    try {
        localStorage.setItem('calculators', JSON.stringify(calculators));
        console.log('Calculators saved to localStorage:', calculators);
    } catch (e) {
        console.error('Error saving calculators to localStorage:', e);
    }
}

// Function to set the "Create New Calculator" button to icon-only state
function setButtonToIconOnly() {
    const createBtn = document.getElementById('createCalculatorBtn');
    if (createBtn) {
        createBtn.classList.add('icon-only');
        const btnText = createBtn.querySelector('.btn-text');
        const btnIcon = createBtn.querySelector('.btn-icon');
        if (btnText) btnText.style.display = 'none';
        if (btnIcon) btnIcon.style.display = 'inline';
        console.log('"Create New Calculator" button set to icon-only state.');
    } else {
        console.error('"Create New Calculator" button not found.');
    }
}

// Function to reset the "Create New Calculator" button to text state
function resetButtonToText() {
    const createBtn = document.getElementById('createCalculatorBtn');
    if (createBtn) {
        createBtn.classList.remove('icon-only');
        const btnText = createBtn.querySelector('.btn-text');
        const btnIcon = createBtn.querySelector('.btn-icon');
        if (btnText) btnText.style.display = 'inline';
        if (btnIcon) btnIcon.style.display = 'none';
        console.log('"Create New Calculator" button reset to text state.');
    } else {
        console.error('"Create New Calculator" button not found.');
    }
}

// Helper function to determine decimal places based on price
function getDecimalPlaces(price) {
    if (price < 10) {
        return 6;
    } else if (price < 100) {
        return 4;
    } else {
        return 2;
    }
}

// Function to format price based on value
function formatPrice(price) {
    const decimals = getDecimalPlaces(price);
    return price.toFixed(decimals);
}

// Function to create a new calculator
function createCalculator(id = null, data = null) {
    const template = document.getElementById('calculatorTemplate');
    if (!template) {
        console.error('Calculator template not found in HTML.');
        return;
    }
    const clone = template.content.cloneNode(true);
    const calculator = clone.querySelector('.calculator');

    if (!calculator) {
        console.error('Calculator element not found in template.');
        return;
    }

    // Assign unique ID
    const calculatorId = id || generateUniqueId();
    calculator.setAttribute('data-id', calculatorId);
    console.log(`Creating calculator with ID: ${calculatorId}`);

    // Initialize data with fallback for trades array and other properties
    const initialData = data && typeof data === 'object' ? {
        ticker: data.ticker || '',
        fee: data.fee !== undefined ? data.fee : 0.1,
        trades: Array.isArray(data.trades) ? data.trades : [],
        lastCalculation: data.lastCalculation || null, // Store last calculation
        isCollapsed: data.isCollapsed !== undefined ? data.isCollapsed : false // Store minimized state
    } : {
        ticker: '',
        fee: 0.1,
        trades: [],
        lastCalculation: null,
        isCollapsed: false
    };
    console.log(`Initial data for calculator ${calculatorId}:`, initialData);

    // If it's a new calculator, add it to the calculators array
    if (!id) {
        calculators.push({ id: calculatorId, data: initialData });
        console.log(`New calculator added to calculators array: ${calculatorId}`);
        saveCalculators();
    } else {
        // Existing calculator, ensure trades array exists
        const existingCalc = calculators.find(c => c.id === calculatorId);
        if (existingCalc && !Array.isArray(existingCalc.data.trades)) {
            existingCalc.data.trades = [];
            console.log(`Trades array initialized for existing calculator ${calculatorId}.`);
            saveCalculators();
        }
    }

    // Populate initial data
    const tickerInput = calculator.querySelector('.ticker');
    const feeInput = calculator.querySelector('.fee');

    if (tickerInput) {
        tickerInput.value = initialData.ticker;
    } else {
        console.error(`Ticker input not found in calculator ${calculatorId}.`);
    }

    if (feeInput) {
        feeInput.value = initialData.fee;
    } else {
        console.error(`Fee input not found in calculator ${calculatorId}.`);
    }

    // Append to container first
    const container = document.getElementById('calculatorsContainer');
    if (container) {
        container.appendChild(clone);
        console.log(`Calculator ${calculatorId} appended to DOM.`);
    } else {
        console.error('Calculators container not found in HTML.');
        return;
    }

    // Now, select the newly added calculator using data-id
    const newCalculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!newCalculator) {
        console.error(`Failed to select calculator ${calculatorId} after appending to DOM.`);
        return;
    }

    // Update title with clickable ticker link
    updateTitle(tickerInput, calculatorId);

    // Display trades
    displayTrades(calculatorId);

    // Restore last calculation if exists
    if (initialData.lastCalculation) {
        displayLastCalculation(calculatorId, initialData.lastCalculation);
    }

    // Apply minimized state if needed
    if (initialData.isCollapsed) {
        newCalculator.classList.add('collapsed');
        const collapseBtn = newCalculator.querySelector('.collapse-btn');
        if (collapseBtn) {
            collapseBtn.setAttribute('aria-label', 'Expand');
            collapseBtn.innerHTML = `
                <!-- Expand Icon SVG (Chevron Down) -->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24">
                    <polyline points="6 15 12 9 18 15"></polyline>
                </svg>
            `;
            console.log(`Calculator ${calculatorId} initialized as collapsed.`);
        }
    }

    // Update calculations
    updateCalculations(calculatorId);

    // Event Listeners
    const addTradeBtn = newCalculator.querySelector('.addTradeBtn');
    if (addTradeBtn) {
        addTradeBtn.addEventListener('click', () => addTrade(calculatorId));
    } else {
        console.error(`Add Trade button not found in calculator ${calculatorId}.`);
    }

    const calculateProfitBtn = newCalculator.querySelector('.calculateProfitBtn');
    if (calculateProfitBtn) {
        calculateProfitBtn.addEventListener('click', () => calculateProfit(calculatorId));
    } else {
        console.error(`Calculate Profit button not found in calculator ${calculatorId}.`);
    }

    const sortAscBtn = newCalculator.querySelector('.sort-btn.asc');
    if (sortAscBtn) {
        sortAscBtn.addEventListener('click', () => sortTrades(calculatorId, 'asc'));
    } else {
        console.error(`Sort Ascending button not found in calculator ${calculatorId}.`);
    }

    const sortDescBtn = newCalculator.querySelector('.sort-btn.desc');
    if (sortDescBtn) {
        sortDescBtn.addEventListener('click', () => sortTrades(calculatorId, 'desc'));
    } else {
        console.error(`Sort Descending button not found in calculator ${calculatorId}.`);
    }

    const collapseBtn = newCalculator.querySelector('.collapse-btn');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', () => toggleCollapse(calculatorId));
    } else {
        console.error(`Collapse button not found in calculator ${calculatorId}.`);
    }

    const deleteCalculatorBtn = newCalculator.querySelector('.delete-calculator-btn');
    if (deleteCalculatorBtn) {
        deleteCalculatorBtn.addEventListener('click', () => deleteCalculator(calculatorId));
    } else {
        console.error(`Delete Calculator button not found in calculator ${calculatorId}.`);
    }

    // Ticker input event listener
    if (tickerInput) {
        tickerInput.addEventListener('input', () => updateTitle(tickerInput, calculatorId));
    }

    // Calculation type change event listener
    const calculationTypeSelect = newCalculator.querySelector('.calculationType');
    if (calculationTypeSelect) {
        calculationTypeSelect.addEventListener('change', () => toggleCalculationInputs(calculatorId));
    } else {
        console.error(`Calculation Type select not found in calculator ${calculatorId}.`);
    }

    // After creating the first calculator, set the button to icon-only
    if (calculators.length === 1) {
        setButtonToIconOnly();
    }
}

// Function to display last calculation results
function displayLastCalculation(calculatorId, lastCalculation) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM for displaying last calculation.`);
        return;
    }

    // Update the '.result' element
    const resultElem = calculator.querySelector(".result");
    if (resultElem && lastCalculation.result) {
        resultElem.innerText = lastCalculation.result;
        console.log(`Last calculation displayed for calculator ${calculatorId}.`);
    } else {
        console.error(`Result element not found or no last calculation data for calculator ${calculatorId}.`);
    }

    // Update the 'profit' span in 'profitOutput'
    const profitElem = calculator.querySelector(".profit");
    if (profitElem && lastCalculation.netProfit !== undefined && lastCalculation.profit !== undefined) {
        profitElem.innerText = `${lastCalculation.profit} USD (${lastCalculation.netProfit} USD)`;
        console.log(`Profit updated for calculator ${calculatorId}: ${lastCalculation.profit} USD (${lastCalculation.netProfit} USD)`);
    } else {
        console.error(`Profit element not found or incomplete profit data for calculator ${calculatorId}.`);
    }

    // Update the 'tickerLabel' span in 'profitOutput'
    const tickerLabel = calculator.querySelector(".tickerLabel");
    if (tickerLabel) {
        const currentTicker = calculators.find(c => c.id === calculatorId)?.data.ticker.toUpperCase() || "";
        tickerLabel.innerText = currentTicker;
        console.log(`Ticker label updated for calculator ${calculatorId}: ${currentTicker}`);
    } else {
        console.error(`Ticker label element not found in calculator ${calculatorId}.`);
    }

    // Update the 'targetPriceDisplay' span in 'profitOutput'
    const targetPriceDisplay = calculator.querySelector(".targetPriceDisplay");
    if (targetPriceDisplay && lastCalculation.targetPrice !== undefined) {
        targetPriceDisplay.innerText = formatPrice(lastCalculation.targetPrice) + ' USD';
        console.log(`Target Price displayed for calculator ${calculatorId}: ${lastCalculation.targetPrice.toFixed(2)} USD`);
    } else {
        console.error(`Target Price display element not found or no target price data for calculator ${calculatorId}.`);
    }

    // Update the 'totalFees' span in 'profitOutput'
    const totalFeesDisplay = calculator.querySelector(".totalFees");
    if (totalFeesDisplay && lastCalculation.totalFees !== undefined) {
        totalFeesDisplay.innerText = lastCalculation.totalFees.toFixed(2) + ' USD';
        console.log(`Total Fees displayed for calculator ${calculatorId}: ${lastCalculation.totalFees.toFixed(2)} USD`);
    } else {
        console.error(`Total Fees display element not found or no total fees data for calculator ${calculatorId}.`);
    }

    // Update the 'profitPercentage' span in 'profitOutput'
    const profitPercentageDisplay = calculator.querySelector(".profitPercentage");
    if (profitPercentageDisplay && lastCalculation.profitPercentage !== undefined) {
        profitPercentageDisplay.innerText = lastCalculation.profitPercentage.toFixed(2) + '%';
        console.log(`Profit Percentage displayed for calculator ${calculatorId}: ${lastCalculation.profitPercentage.toFixed(2)}%`);
    } else {
        console.error(`Profit Percentage display element not found or no profit percentage data for calculator ${calculatorId}.`);
    }
}

// Function to update the title with the ticker in neon green and as a clickable link
function updateTitle(tickerElement, calculatorId) {
    const calculator = tickerElement.closest('.calculator');
    const ticker = tickerElement.value.trim().toUpperCase(); // Ensure ticker is uppercase
    const title = calculator.querySelector('.mainTitle');

    if (title) {
        if (ticker) {
            // Construct the TradingView URL with the entered ticker
            const tradingViewURL = `https://www.tradingview.com/chart/?symbol=GATEIO%3A${ticker}USDT`;
            // Update the title with a clickable link using the ticker-link class
            title.innerHTML = `Trading Calculator <a href="${tradingViewURL}" target="_blank" class="ticker-link" aria-label="View ${ticker} charts on TradingView">${ticker}</a>`;
        } else {
            // If ticker is empty, display without a link
            title.innerHTML = "Trading Calculator";
        }
        console.log(`Title updated to: ${title.innerHTML}`);
    } else {
        console.error('Main Title element not found.');
    }

    // Update data in calculators array
    const calc = calculators.find(c => c.id === calculatorId);
    if (calc) {
        calc.data.ticker = ticker;
        saveCalculators();
        console.log(`Ticker updated for calculator ${calculatorId}: ${ticker}`);

        // Update the tickerLabel in profitOutput
        const tickerLabel = calculator.querySelector(".tickerLabel");
        if (tickerLabel) {
            tickerLabel.innerText = ticker;
            console.log(`Ticker label updated for calculator ${calculatorId}: ${ticker}`);
        } else {
            console.error(`Ticker label element not found in calculator ${calculatorId}.`);
        }
    } else {
        console.error(`Calculator with ID ${calculatorId} not found in calculators array.`);
    }
}

// Function to add a trade
function addTrade(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    const amountInput = calculator.querySelector('.amount');
    const priceInput = calculator.querySelector('.price');
    const feeInput = calculator.querySelector('.fee');

    const amount = parseFloat(amountInput.value);
    const price = parseFloat(priceInput.value);
    const fee = parseFloat(feeInput.value) / 100;

    let isValid = true;

    // Validate Amount
    if (isNaN(amount) || amount <= 0) {
        amountInput.classList.add('invalid');
        isValid = false;
    } else {
        amountInput.classList.remove('invalid');
    }

    // Validate Price
    if (isNaN(price) || price <= 0) {
        priceInput.classList.add('invalid');
        isValid = false;
    } else {
        priceInput.classList.remove('invalid');
    }

    if (!isValid) {
        alert("Please enter valid positive numbers for Amount and Price.");
        console.warn(`Invalid trade input for calculator ${calculatorId}: amount=${amount}, price=${price}`);
        return;
    }

    const trade = { amount, price, fee };
    console.log(`Adding trade to calculator ${calculatorId}:`, trade);

    // Find the calculator data
    const calc = calculators.find(c => c.id === calculatorId);
    if (calc) {
        calc.data.trades.push(trade);
        saveCalculators();
        displayTrades(calculatorId);
        updateCalculations(calculatorId);

        // Clear input fields
        amountInput.value = '';
        priceInput.value = '';
        console.log(`Trade added and inputs cleared for calculator ${calculatorId}.`);

        // Success message removed as per user request
    } else {
        console.error(`Calculator with ID ${calculatorId} not found.`);
    }
}

// Function to display trades
function displayTrades(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM.`);
        return;
    }
    const tbody = calculator.querySelector('.tradesTable tbody');
    if (!tbody) {
        console.error(`Trades table body not found in calculator ${calculatorId}.`);
        return;
    }
    tbody.innerHTML = ''; // Clear existing trades

    const calc = calculators.find(c => c.id === calculatorId);
    if (calc && Array.isArray(calc.data.trades)) {
        calc.data.trades.forEach((trade, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${trade.amount}</td>
                <td>${formatPrice(trade.price)}</td>
                <td>${(trade.fee * 100).toFixed(2)}%</td>
                <td>
                    <button class="icon-btn delete-btn" aria-label="Delete Trade">
                        <!-- Delete Icon SVG (Trash) -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6l-1 14H6L5 6"></path>
                            <path d="M10 11v6"></path>
                            <path d="M14 11v6"></path>
                            <path d="M9 6V4h6v2"></path>
                        </svg>
                    </button>
                </td>
            `;

            // Add event listener for delete button
            const deleteBtn = row.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => deleteTrade(calculatorId, index));
            } else {
                console.error(`Delete Trade button not found in trade row for calculator ${calculatorId}.`);
            }

            tbody.appendChild(row);
        });
        console.log(`Trades displayed for calculator ${calculatorId}.`);
    } else {
        console.warn(`No trades found for calculator ${calculatorId}.`);
    }
}

// Function to delete a trade
function deleteTrade(calculatorId, index) {
    const calc = calculators.find(c => c.id === calculatorId);
    if (calc && Array.isArray(calc.data.trades)) {
        const removedTrade = calc.data.trades.splice(index, 1)[0];
        console.log(`Trade removed from calculator ${calculatorId}:`, removedTrade);
        saveCalculators();
        displayTrades(calculatorId);
        updateCalculations(calculatorId);

        // Success message removed as per user request
    } else {
        console.error(`Calculator ${calculatorId} not found or trades array is invalid.`);
    }
}

// Function to update calculations
function updateCalculations(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM for calculations.`);
        return;
    }

    const calc = calculators.find(c => c.id === calculatorId);
    if (calc && Array.isArray(calc.data.trades)) {
        let totalCost = 0, totalAmount = 0, totalFees = 0, totalUSD = 0;

        calc.data.trades.forEach(trade => {
            totalCost += trade.amount * trade.price;
            totalFees += trade.amount * trade.price * trade.fee;
            totalAmount += trade.amount;
            totalUSD += trade.amount * trade.price;
        });

        const averagePrice = totalAmount ? (totalCost + totalFees) / totalAmount : 0;
        const averagePriceElem = calculator.querySelector(".averagePrice");
        const totalAmountElem = calculator.querySelector(".totalAmount");
        const totalUSDElem = calculator.querySelector(".totalUSD");
        const totalFeesElem = calculator.querySelector(".totalFees"); // New Element

        if (averagePriceElem) {
            averagePriceElem.innerText = formatPrice(averagePrice) + ' USD';
        } else {
            console.error(`Average Price element not found in calculator ${calculatorId}.`);
        }

        if (totalAmountElem) {
            totalAmountElem.innerText = totalAmount.toFixed(2);
        } else {
            console.error(`Total Amount element not found in calculator ${calculatorId}.`);
        }

        if (totalUSDElem) {
            totalUSDElem.innerText = totalUSD.toFixed(2) + ' USD';
        } else {
            console.error(`Total USD element not found in calculator ${calculatorId}.`);
        }

        if (totalFeesElem) { // Update Total Fees Display
            totalFeesElem.innerText = totalFees.toFixed(2) + ' USD';
        } else {
            console.error(`Total Fees element not found in calculator ${calculatorId}.`);
        }

        console.log(`Calculations updated for calculator ${calculatorId}: Total Amount=${totalAmount}, Total USD=${totalUSD}, Total Fees=${totalFees}, Average Price=${averagePrice}`);
    } else {
        console.warn(`No trades to calculate for calculator ${calculatorId}.`);
    }
}

// Function to calculate profit
function calculateProfit(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM for profit calculation.`);
        return;
    }

    const calc = calculators.find(c => c.id === calculatorId);
    if (calc && Array.isArray(calc.data.trades)) {
        let totalCost = 0, totalAmount = 0, totalFees = 0;

        // Calculate total cost, total amount, and total fees (buy fees)
        calc.data.trades.forEach(trade => {
            totalCost += trade.amount * trade.price;
            totalFees += trade.amount * trade.price * trade.fee; // Buy fees
            totalAmount += trade.amount;
        }); 

        const averagePrice = totalAmount ? (totalCost + totalFees) / totalAmount : 0;
        const calculationType = calculator.querySelector(".calculationType").value;

        let resultText = "";
        let grossProfitValue = 0; // Gross Profit before sell fees
        let netProfitValue = 0;   // Net Profit after sell fees
        let targetPriceValue = 0; // Target price for display
        let totalFeesValue = totalFees.toFixed(2); // Total buy fees
        let profitPercentageValue = 0; // Profit Percentage

        if (calculationType === "percentage") {
            const takeProfitInput = calculator.querySelector(".takeProfit");
            const takeProfit = parseFloat(takeProfitInput.value) || 0;

            // Desired net profit based on original cost (excluding buy fees)
            const desiredNetProfit = (totalCost) * (takeProfit / 100);
            console.log(`Desired Net Profit: ${desiredNetProfit.toFixed(2)} USD`);

            // Calculate target price to achieve desired net profit after sell fees
            const sellFeePercent = calc.data.fee / 100;
            const targetPrice = (totalCost + desiredNetProfit + totalFees) / (totalAmount * (1 - sellFeePercent));
            const revenue = targetPrice * totalAmount;
            const sellFees = revenue * sellFeePercent;
            const netRevenue = revenue - sellFees;
            const netProfit = netRevenue - totalCost - totalFees;
            const grossProfit = revenue - totalCost - totalFees;

            // Calculate profit percentage based on original cost (excluding buy fees)
            profitPercentageValue = (desiredNetProfit / totalCost) * 100;

            // Assign values for display
            grossProfitValue = grossProfit.toFixed(2); // Gross Profit before sell fees
            netProfitValue = netProfit.toFixed(2);     // Net Profit after sell fees
            targetPriceValue = formatPrice(targetPrice);
            resultText = `Target Price: ${targetPriceValue} USD, Profit: ${netProfit.toFixed(2)} USD`;
            console.log(`Profit calculated for calculator ${calculatorId} (Percentage):`, resultText);

        } else {
            // Existing Target Price calculation type (assumed correct)
            const targetPriceInput = calculator.querySelector(".targetPrice");
            const targetPrice = parseFloat(targetPriceInput.value) || 0;
            const revenue = targetPrice * totalAmount;

            // Calculate sell fees based on target price
            const sellFeePercent = calc.data.fee / 100;
            const sellFees = revenue * sellFeePercent;

            // Net profit after subtracting both buy and sell fees
            const netProfit = revenue - totalCost - totalFees - sellFees;
            const grossProfit = revenue - totalCost - totalFees;

            // Calculate profit percentage based on original cost (excluding buy fees)
            profitPercentageValue = (netProfit / totalCost) * 100;

            // Assign values for display
            grossProfitValue = grossProfit.toFixed(2); // Gross Profit before sell fees
            netProfitValue = netProfit.toFixed(2);     // Net Profit after sell fees
            targetPriceValue = formatPrice(targetPrice);
            resultText = `Profit: ${netProfit.toFixed(2)} USD, Profit Percentage: ${profitPercentageValue.toFixed(2)}%`;
            console.log(`Profit calculated for calculator ${calculatorId} (Target Price):`, resultText);
        }

        // Update the 'profit' element with gross profit and net profit
        const profitElem = calculator.querySelector(".profit");
        if (profitElem) {
            profitElem.innerText = `${grossProfitValue} USD (${netProfitValue} USD)`;
        } else {
            console.error(`Profit element not found in calculator ${calculatorId}.`);
        }

        // Update the 'result' element with resultText
        const resultElem = calculator.querySelector(".result");
        if (resultElem) {
            resultElem.innerText = resultText;
        } else {
            console.error(`Result element not found in calculator ${calculatorId}.`);
        }

        // Update the 'tickerLabel' span in 'profitOutput'
        const tickerLabel = calculator.querySelector(".tickerLabel");
        if (tickerLabel) {
            const currentTicker = calc.data.ticker ? calc.data.ticker.toUpperCase() : "";
            tickerLabel.innerText = currentTicker;
            console.log(`Ticker label updated for calculator ${calculatorId}: ${currentTicker}`);
        } else {
            console.error(`Ticker label element not found in calculator ${calculatorId}.`);
        }

        // Update the 'targetPriceDisplay' span in 'profitOutput'
        const targetPriceDisplay = calculator.querySelector(".targetPriceDisplay");
        if (targetPriceDisplay) {
            targetPriceDisplay.innerText = targetPriceValue + ' USD';
            console.log(`Target Price displayed for calculator ${calculatorId}: ${targetPriceValue} USD`);
        } else {
            console.error(`Target Price display element not found or no target price data for calculator ${calculatorId}.`);
        }

        // Update the 'totalFees' span in 'profitOutput'
        const totalFeesDisplay = calculator.querySelector(".totalFees");
        if (totalFeesDisplay) {
            totalFeesDisplay.innerText = totalFeesValue + ' USD';
            console.log(`Total Fees displayed for calculator ${calculatorId}: ${totalFeesValue} USD`);
        } else {
            console.error(`Total Fees display element not found or no total fees data for calculator ${calculatorId}.`);
        }

        // Update the 'profitPercentage' span in 'profitOutput'
        const profitPercentageDisplay = calculator.querySelector(".profitPercentage");
        if (profitPercentageDisplay) {
            profitPercentageDisplay.innerText = profitPercentageValue.toFixed(2) + '%';
            console.log(`Profit Percentage displayed for calculator ${calculatorId}: ${profitPercentageValue.toFixed(2)}%`);
        } else {
            console.error(`Profit Percentage display element not found or no profit percentage data for calculator ${calculatorId}.`);
        }

        // Store last calculation in localStorage
        if (calc) {
            calc.data.lastCalculation = {
                type: calculationType,
                value: calculationType === "percentage" ? parseFloat(calculator.querySelector(".takeProfit").value) : parseFloat(calculator.querySelector(".targetPrice").value),
                result: resultText,
                profit: parseFloat(grossProfitValue),
                netProfit: parseFloat(netProfitValue),
                targetPrice: parseFloat(targetPriceValue),
                totalFees: parseFloat(totalFeesValue), // Store totalFees explicitly (buy fees)
                profitPercentage: parseFloat(profitPercentageValue.toFixed(2)), // Store profitPercentage explicitly
            };
            saveCalculators();
            console.log(`Last calculation stored for calculator ${calculatorId}:`, calc.data.lastCalculation);
        }
    }
}

// Function to toggle calculation inputs based on selected type
function toggleCalculationInputs(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM for toggling calculation inputs.`);
        return;
    }

    const calculationType = calculator.querySelector('.calculationType').value;

    if (calculationType === "percentage") {
        const percentageInput = calculator.querySelector('.percentageInput');
        const targetPriceInput = calculator.querySelector('.targetPriceInput');
        if (percentageInput && targetPriceInput) {
            percentageInput.style.display = "block";
            targetPriceInput.style.display = "none";
            console.log(`Calculator ${calculatorId}: Showed percentage input, hid target price input.`);
        }
    } else {
        const percentageInput = calculator.querySelector('.percentageInput');
        const targetPriceInput = calculator.querySelector('.targetPriceInput');
        if (percentageInput && targetPriceInput) {
            percentageInput.style.display = "none";
            targetPriceInput.style.display = "block";
            console.log(`Calculator ${calculatorId}: Hid percentage input, showed target price input.`);
        }
    }
}

// Function to sort trades
function sortTrades(calculatorId, order) {
    const calc = calculators.find(c => c.id === calculatorId);
    if (calc && Array.isArray(calc.data.trades)) {
        calc.data.trades.sort((a, b) => {
            if (order === 'asc') {
                return a.amount - b.amount;
            } else if (order === 'desc') {
                return b.amount - a.amount;
            }
            return 0;
        });
        console.log(`Trades sorted in '${order}' order for calculator ${calculatorId}.`);
        saveCalculators();
        displayTrades(calculatorId);
    } else {
        console.error(`Calculator ${calculatorId} not found or trades array is invalid for sorting.`);
    }
}

// Function to toggle collapse/expand
function toggleCollapse(calculatorId) {
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (!calculator) {
        console.error(`Calculator ${calculatorId} not found in DOM for toggling collapse.`);
        return;
    }

    const isCollapsed = calculator.classList.toggle('collapsed');
    const collapseBtn = calculator.querySelector('.collapse-btn');

    if (!collapseBtn) {
        console.error(`Collapse button not found in calculator ${calculatorId}.`);
        return;
    }

    if (isCollapsed) {
        collapseBtn.setAttribute('aria-label', 'Expand');
        collapseBtn.innerHTML = `
            <!-- Expand Icon SVG (Chevron Down) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="6 15 12 9 18 15"></polyline>
            </svg>
        `;
        console.log(`Calculator ${calculatorId} collapsed.`);
    } else {
        collapseBtn.setAttribute('aria-label', 'Collapse');
        collapseBtn.innerHTML = `
            <!-- Collapse Icon SVG (Chevron Up) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        console.log(`Calculator ${calculatorId} expanded.`);
    }

    // Update the collapsed state in localStorage
    const calc = calculators.find(c => c.id === calculatorId);
    if (calc) {
        calc.data.isCollapsed = isCollapsed;
        saveCalculators();
        console.log(`Calculator ${calculatorId} collapse state updated to: ${isCollapsed}`);
    } else {
        console.error(`Calculator ${calculatorId} not found in calculators array.`);
    }
}

// Function to delete entire calculator
function deleteCalculator(calculatorId) {
    // Confirm deletion
    const confirmDelete = confirm("Are you sure you want to delete this calculator?");
    if (!confirmDelete) {
        console.log(`Deletion cancelled for calculator ${calculatorId}.`);
        return;
    }

    // Remove from calculators array
    const removedCalcIndex = calculators.findIndex(c => c.id === calculatorId);
    if (removedCalcIndex === -1) {
        console.error(`Calculator ${calculatorId} not found in calculators array.`);
        return;
    }
    const removedCalc = calculators.splice(removedCalcIndex, 1)[0];
    console.log(`Calculator deleted:`, removedCalc);
    saveCalculators();

    // Remove from DOM
    const calculator = document.querySelector(`.calculator[data-id="${calculatorId}"]`);
    if (calculator) {
        calculator.remove();
        console.log(`Calculator ${calculatorId} removed from DOM.`);
    } else {
        console.error(`Calculator ${calculatorId} not found in DOM.`);
    }

    // If no calculators remain, reset the button to show text
    if (calculators.length === 0) {
        resetButtonToText();
    }
}

// Event Listener for Create New Calculator button
document.getElementById('createCalculatorBtn').addEventListener('click', () => {
    createCalculator();
});

// Function to load all calculators from localStorage
function loadCalculators() {
    try {
        const storedCalculators = localStorage.getItem('calculators');
        if (storedCalculators) {
            calculators = JSON.parse(storedCalculators);
            console.log('Calculators loaded from localStorage:', calculators);
        } else {
            calculators = [];
            console.log('No calculators found in localStorage. Initializing empty array.');
        }
    } catch (e) {
        console.error('Error loading calculators from localStorage:', e);
        calculators = [];
    }

    if (calculators.length > 0) {
        calculators.forEach(calc => {
            createCalculator(calc.id, calc.data);
        });
        setButtonToIconOnly();
    } else {
        // Optionally, create a default calculator
        createCalculator();
    }
}

// Initialize on page load
window.onload = function() {
    loadCalculators();
};
