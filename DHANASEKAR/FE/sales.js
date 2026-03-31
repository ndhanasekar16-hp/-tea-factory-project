// ============================================
// SALES MANAGEMENT MODULE - JavaScript
// ============================================

// Global Variables
let currentSaleItems = [];
let customers = [];
let products = [];
let currentSale = null;
let charts = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    loadCustomers();
    loadProducts();
    initializeEventListeners();
    loadSalesList();
    loadAnalytics();
    loadCustomersGrid();
});

function initializeEventListeners() {
    document.getElementById('customerSelect').addEventListener('change', onCustomerSelected);
    document.getElementById('discountPercentage').addEventListener('change', calculateTotals);
    document.getElementById('discountAmount').addEventListener('change', calculateTotals);
    document.getElementById('saleType').addEventListener('change', calculateTotals);
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active state from all buttons
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
        btn.classList.remove('border-b-2', 'border-purple-600', 'text-purple-600');
        btn.classList.add('text-gray-600', 'hover:text-purple-600');
    });

    // Show selected tab
    document.getElementById(tabName).classList.remove('hidden');

    // Add active state to clicked button
    const tabBtn = document.getElementById('tab-' + tabName);
    tabBtn.classList.remove('text-gray-600', 'hover:text-purple-600');
    tabBtn.classList.add('border-b-2', 'border-purple-600', 'text-purple-600');

    // Trigger data loading for specific tabs
    if (tabName === 'sales-list') {
        loadSalesList();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    } else if (tabName === 'customers') {
        loadCustomersGrid();
    }
}

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

function loadCustomers() {
    fetch('api/customers.php')
        .then(response => response.json())
        .then(data => {
            customers = data.customers || [];
            populateCustomerSelect();
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            showAlert('Error loading customers', 'error');
        });
}

function populateCustomerSelect() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = '<option value="">-- Select or Add Customer --</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.customer_id;
        option.textContent = `${customer.customer_name} (${customer.customer_type})`;
        select.appendChild(option);
    });
}

function onCustomerSelected(event) {
    const customerId = parseInt(event.target.value);
    if (!customerId) {
        document.getElementById('customerDetailsDisplay').classList.add('hidden');
        return;
    }

    const customer = customers.find(c => c.customer_id === customerId);
    if (customer) {
        displayCustomerDetails(customer);
        document.getElementById('customerDetailsDisplay').classList.remove('hidden');
    }
}

function displayCustomerDetails(customer) {
    document.getElementById('displayCustomerName').textContent = customer.customer_name;
    document.getElementById('displayCustomerType').textContent = customer.customer_type;
    document.getElementById('displayCustomerGST').textContent = customer.gst_number || 'N/A';
    document.getElementById('displayCustomerPhone').textContent = customer.phone;
    document.getElementById('displayCustomerEmail').textContent = customer.email || 'N/A';
    document.getElementById('displayCustomerLocation').textContent = `${customer.city || ''}, ${customer.state || ''}`.trim() || 'N/A';
}

function openAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.remove('hidden');
}

function closeAddCustomerModal() {
    document.getElementById('addCustomerModal').classList.add('hidden');
    document.getElementById('addCustomerForm').reset();
}

function submitAddCustomer(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const customerData = {
        customer_name: formData.get('customer_name'),
        customer_type: formData.get('customer_type'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        gst_number: formData.get('gst_number'),
        credit_limit: parseFloat(formData.get('credit_limit')) || 0,
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode')
    };

    fetch('api/customers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.customer) {
                customers.push(data.customer);
                populateCustomerSelect();
                document.getElementById('customerSelect').value = data.customer.customer_id;
                onCustomerSelected({ target: document.getElementById('customerSelect') });
                closeAddCustomerModal();
                showAlert('Customer added successfully', 'success');
                loadCustomersGrid();
            }
        })
        .catch(error => {
            console.error('Error adding customer:', error);
            showAlert('Error adding customer', 'error');
        });
}

function loadCustomersGrid() {
    const container = document.getElementById('customersContainer');
    container.innerHTML = '';

    customers.forEach(customer => {
        const card = document.createElement('div');
        card.className = 'bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800">${customer.customer_name}</h3>
                <span class="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">${customer.customer_type}</span>
            </div>
            <div class="space-y-2 text-sm">
                <p><i class="fas fa-phone text-purple-600 mr-2 w-4"></i> ${customer.phone}</p>
                <p><i class="fas fa-envelope text-purple-600 mr-2 w-4"></i> ${customer.email || 'N/A'}</p>
                <p><i class="fas fa-map-marker-alt text-purple-600 mr-2 w-4"></i> ${customer.city || ''} ${customer.state || ''}</p>
                ${customer.gst_number ? `<p><i class="fas fa-file text-purple-600 mr-2 w-4"></i> ${customer.gst_number}</p>` : ''}
                <p class="text-green-600"><i class="fas fa-credit-card mr-2 w-4"></i> Credit Limit: ₹${parseFloat(customer.credit_limit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
        `;
        container.appendChild(card);
    });

    if (customers.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">No customers found</p>';
    }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function loadProducts() {
    fetch('api/inventory.php')
        .then(response => response.json())
        .then(data => {
            products = data.inventory || [];
            populateProductSelect();
        })
        .catch(error => {
            console.error('Error loading products:', error);
            showAlert('Error loading products', 'error');
        });
}

function populateProductSelect() {
    const select = document.getElementById('productSelect');
    select.innerHTML = '<option value="">-- Select Product --</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.inventory_id;
        option.dataset.price = product.selling_price;
        option.dataset.costPrice = product.cost_per_kg;
        option.dataset.stock = product.current_stock_kg;
        option.dataset.name = product.product_name;
        option.dataset.code = product.product_code;
        option.textContent = `${product.product_name} (${product.grade}) - Stock: ${parseFloat(product.current_stock_kg).toFixed(2)}kg @ ₹${parseFloat(product.selling_price).toFixed(2)}/kg`;
        select.appendChild(option);
    });
}

// ============================================
// CART/SALE ITEMS MANAGEMENT
// ============================================

function addProductToCart() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');

    if (!productSelect.value) {
        showAlert('Please select a product', 'error');
        return;
    }

    const quantity = parseFloat(quantityInput.value);
    if (quantity <= 0) {
        showAlert('Please enter a valid quantity', 'error');
        return;
    }

    const option = productSelect.options[productSelect.selectedIndex];
    const inventoryId = parseInt(productSelect.value);
    const stock = parseFloat(option.dataset.stock);

    if (quantity > stock) {
        showAlert(`Insufficient stock. Available: ${stock}kg`, 'error');
        return;
    }

    // Check if item already exists
    const existingItem = currentSaleItems.find(item => item.inventory_id === inventoryId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        currentSaleItems.push({
            inventory_id: inventoryId,
            product_name: option.dataset.name,
            product_code: option.dataset.code,
            quantity: quantity,
            unit_price: parseFloat(option.dataset.price),
            cost_price: parseFloat(option.dataset.costPrice),
            discount: 0
        });
    }

    // Reset inputs
    productSelect.value = '';
    quantityInput.value = '';
    quantityInput.focus();

    renderSaleItems();
    calculateTotals();
}

function renderSaleItems() {
    const container = document.getElementById('saleItemsContainer');

    if (currentSaleItems.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No items added yet</p>';
        return;
    }

    container.innerHTML = currentSaleItems.map((item, index) => `
        <div class="bg-gray-50 p-4 rounded-lg border border-gray-300 flex items-center justify-between">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.product_name}</h4>
                <p class="text-sm text-gray-600">${item.product_code} | ${item.quantity.toFixed(2)}kg @ ₹${item.unit_price.toFixed(2)}/kg</p>
                <p class="text-sm text-green-600">Profit per unit: ₹${(item.unit_price - item.cost_price).toFixed(2)}</p>
            </div>
            <div class="text-right mr-4">
                <p class="font-semibold text-gray-800">₹${(item.quantity * item.unit_price).toFixed(2)}</p>
                <p class="text-sm text-gray-600">Cost: ₹${(item.quantity * item.cost_price).toFixed(2)}</p>
            </div>
            <button type="button" onclick="removeFromCart(${index})" class="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

function removeFromCart(index) {
    currentSaleItems.splice(index, 1);
    renderSaleItems();
    calculateTotals();
}

// ============================================
// CALCULATIONS
// ============================================

function calculateTotals() {
    let subtotal = 0;
    let totalProfit = 0;

    currentSaleItems.forEach(item => {
        const lineTotal = item.quantity * item.unit_price;
        const lineProfit = item.quantity * (item.unit_price - item.cost_price);
        subtotal += lineTotal;
        totalProfit += lineProfit;
    });

    const discountPercentage = parseFloat(document.getElementById('discountPercentage').value) || 0;
    const discountAmount = parseFloat(document.getElementById('discountAmount').value) || 0;

    // Apply discount percentage first, then add flat discount
    const percentageDiscountAmount = (subtotal * discountPercentage) / 100;
    const totalDiscount = percentageDiscountAmount + discountAmount;
    const subtotalAfterDiscount = subtotal - totalDiscount;

    // Calculate tax
    const isInterstate = document.getElementById('saleType').value === 'interstate';
    const taxRate = 18; // 18% GST
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

    const cgstAmount = isInterstate ? 0 : taxAmount / 2;
    const sgstAmount = isInterstate ? 0 : taxAmount / 2;
    const igstAmount = isInterstate ? taxAmount : 0;

    const grandTotal = subtotalAfterDiscount + taxAmount;

    // Update summary display
    document.getElementById('summarySubtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summaryDiscount').textContent = `-₹${totalDiscount.toFixed(2)}`;
    document.getElementById('summarySubtotalAfter').textContent = `₹${subtotalAfterDiscount.toFixed(2)}`;
    document.getElementById('summaryCGST').textContent = `₹${cgstAmount.toFixed(2)}`;
    document.getElementById('summarySGST').textContent = `₹${sgstAmount.toFixed(2)}`;
    document.getElementById('summaryIGST').textContent = `₹${igstAmount.toFixed(2)}`;

    // Toggle tax display
    if (isInterstate) {
        document.getElementById('taxDetails').classList.add('hidden');
        document.getElementById('igstDetail').classList.remove('hidden');
    } else {
        document.getElementById('taxDetails').classList.remove('hidden');
        document.getElementById('igstDetail').classList.add('hidden');
    }

    document.getElementById('summaryGrandTotal').textContent = `₹${grandTotal.toFixed(2)}`;
    document.getElementById('summaryProfit').textContent = `₹${(totalProfit - totalDiscount).toFixed(2)}`;

    // Check stock levels
    checkStockLevels();

    return {
        subtotal,
        discount: totalDiscount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        igst: igstAmount,
        tax: taxAmount,
        grandTotal,
        profit: totalProfit
    };
}

function checkStockLevels() {
    let lowStockItems = [];
    let outOfStockItems = [];

    currentSaleItems.forEach(item => {
        const product = products.find(p => p.inventory_id === item.inventory_id);
        if (product) {
            const remainingStock = product.current_stock_kg - item.quantity;
            if (remainingStock < 0) {
                outOfStockItems.push(item.product_name);
            } else if (remainingStock < product.opening_stock_kg * 0.2) { // 20% threshold
                lowStockItems.push(`${item.product_name} (${remainingStock.toFixed(2)}kg remaining)`);
            }
        }
    });

    const lowStockAlert = document.getElementById('lowStockAlert');
    const outOfStockAlert = document.getElementById('outOfStockAlert');
    const stockOkAlert = document.getElementById('stockOkAlert');

    lowStockAlert.classList.toggle('hidden', lowStockItems.length === 0);
    outOfStockAlert.classList.toggle('hidden', outOfStockItems.length === 0);
    stockOkAlert.classList.toggle('hidden', lowStockItems.length > 0 || outOfStockItems.length > 0);

    if (lowStockItems.length > 0) {
        lowStockAlert.textContent = `⚠️ Low stock: ${lowStockItems.join(', ')}`;
    }
    if (outOfStockItems.length > 0) {
        outOfStockAlert.textContent = `❌ Out of stock: ${outOfStockItems.join(', ')}`;
    }
}

// ============================================
// SALE SUBMISSION
// ============================================

function submitSale() {
    const customerId = parseInt(document.getElementById('customerSelect').value);
    if (!customerId) {
        showAlert('Please select a customer', 'error');
        return;
    }

    if (currentSaleItems.length === 0) {
        showAlert('Please add at least one item to the sale', 'error');
        return;
    }

    const totals = calculateTotals();
    const paymentMode = document.getElementById('paymentMode').value;
    const transactionId = document.getElementById('transactionId').value;
    const saleType = document.getElementById('saleType').value;

    const saleData = {
        action: 'create',
        customer_id: customerId,
        sale_date: new Date().toISOString().split('T')[0],
        sale_time: new Date().toTimeString().split(' ')[0],
        items: currentSaleItems.map(item => ({
            inventory_id: item.inventory_id,
            product_name: item.product_name,
            product_code: item.product_code,
            quantity: item.quantity,
            unit_price: item.unit_price,
            cost_price: item.cost_price,
            discount: item.discount
        })),
        discount_amount: totals.discount,
        tax_rate: saleType === 'interstate' ? 18 : 18,
        is_interstate: saleType === 'interstate',
        payment_mode: paymentMode,
        payment_status: 'completed',
        transaction_id: transactionId || null
    };

    fetch('api/sales.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.sale_id) {
                currentSale = data;
                showAlert('Sale completed successfully! Invoice: ' + data.invoice_number, 'success');
                
                // Reset form
                currentSaleItems = [];
                document.getElementById('customerSelect').value = '';
                document.getElementById('discountPercentage').value = 0;
                document.getElementById('discountAmount').value = 0;
                document.getElementById('transactionId').value = '';
                document.getElementById('customerDetailsDisplay').classList.add('hidden');
                renderSaleItems();
                calculateTotals();

                // Show invoice buttons
                document.getElementById('printInvoiceBtn').classList.remove('hidden');
                document.getElementById('downloadPdfBtn').classList.remove('hidden');

                // Auto-load new sale in list
                setTimeout(() => {
                    loadSalesList();
                    loadAnalytics();
                }, 1000);
            } else if (data.error) {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error submitting sale:', error);
            showAlert('Error submitting sale: ' + error.message, 'error');
        });
}

// ============================================
// SALES LIST
// ============================================

function loadSalesList() {
    fetch('api/sales.php?action=list')
        .then(response => response.json())
        .then(data => {
            const sales = data.sales || [];
            renderSalesTable(sales);
        })
        .catch(error => {
            console.error('Error loading sales:', error);
            showAlert('Error loading sales', 'error');
        });
}

function renderSalesTable(sales) {
    const tbody = document.getElementById('salesTable');

    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">No sales records found</td></tr>';
        return;
    }

    tbody.innerHTML = sales.map(sale => {
        const statusColor = sale.payment_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        return `
            <tr class="border-b border-gray-200 hover:bg-gray-50 transition">
                <td class="px-4 py-4 font-semibold">${sale.invoice_number}</td>
                <td class="px-4 py-4">${new Date(sale.sale_date).toLocaleDateString('en-IN')}</td>
                <td class="px-4 py-4">${sale.customer_name}</td>
                <td class="px-4 py-4 font-semibold">₹${parseFloat(sale.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td class="px-4 py-4 text-green-600 font-semibold">₹${parseFloat(sale.total_profit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td class="px-4 py-4">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold ${statusColor}">
                        ${sale.payment_status.charAt(0).toUpperCase() + sale.payment_status.slice(1)}
                    </span>
                </td>
                <td class="px-4 py-4 space-x-2">
                    <button onclick="viewInvoice(${sale.sale_id})" class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    <button onclick="deleteSale(${sale.sale_id})" class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// INVOICE MANAGEMENT
// ============================================

function viewInvoice(saleId) {
    fetch(`api/sales.php?action=invoice&id=${saleId}`)
        .then(response => response.json())
        .then(data => {
            if (data.sale && data.items) {
                currentSale = { sale: data.sale, items: data.items, company: data.company };
                renderInvoiceModal(data.sale, data.items, data.company);
            }
        })
        .catch(error => {
            console.error('Error loading invoice:', error);
            showAlert('Error loading invoice', 'error');
        });
}

function renderInvoiceModal(sale, items, company) {
    const content = document.getElementById('invoiceContent');

    const taxLabel = sale.igst_amount > 0 ? 'IGST (18%)' : 'CGST + SGST (18%)';
    const taxAmount = sale.igst_amount > 0 ? sale.igst_amount : (sale.cgst_amount + sale.sgst_amount);

    content.innerHTML = `
        <div id="printableInvoice" class="bg-white p-8">
            <!-- Header -->
            <div class="border-b-2 border-gray-300 pb-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-800">INVOICE</h1>
                        <p class="text-gray-600">${company.factory_name || 'Tea Factory'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-purple-600">${sale.invoice_number}</p>
                        <p class="text-gray-600">${new Date(sale.sale_date).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-8">
                    <div>
                        <h3 class="font-bold text-gray-800 mb-2">FROM:</h3>
                        <p class="font-semibold">${company.factory_name || 'Tea Factory'}</p>
                        <p class="text-sm text-gray-600">${company.address || ''}</p>
                        <p class="text-sm text-gray-600">GST: ${company.gst_number || 'N/A'}</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 mb-2">BILL TO:</h3>
                        <p class="font-semibold">${sale.customer_name}</p>
                        <p class="text-sm text-gray-600">${sale.address || ''}</p>
                        <p class="text-sm text-gray-600">${sale.city || ''} ${sale.state || ''} ${sale.pincode || ''}</p>
                        ${sale.gst_number ? `<p class="text-sm text-gray-600">GST: ${sale.gst_number}</p>` : ''}
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <table class="w-full mb-6 text-sm">
                <thead class="bg-gray-100 border border-gray-300">
                    <tr>
                        <th class="px-4 py-2 text-left">Product</th>
                        <th class="px-4 py-2 text-center">Qty (kg)</th>
                        <th class="px-4 py-2 text-right">Unit Price (₹)</th>
                        <th class="px-4 py-2 text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr class="border border-gray-300">
                            <td class="px-4 py-2">${item.product_name}<br><span class="text-xs text-gray-600">${item.product_code}</span></td>
                            <td class="px-4 py-2 text-center">${parseFloat(item.quantity_sold).toFixed(2)}</td>
                            <td class="px-4 py-2 text-right">₹${parseFloat(item.unit_price).toFixed(2)}</td>
                            <td class="px-4 py-2 text-right">₹${parseFloat(item.line_subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Totals -->
            <div class="flex justify-end mb-6">
                <div class="w-64 border border-gray-300">
                    <div class="flex justify-between px-4 py-2 border-b">
                        <span>Subtotal:</span>
                        <span>₹${parseFloat(sale.subtotal).toFixed(2)}</span>
                    </div>
                    ${sale.discount_amount > 0 ? `
                        <div class="flex justify-between px-4 py-2 border-b text-red-600">
                            <span>Discount:</span>
                            <span>-₹${parseFloat(sale.discount_amount).toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between px-4 py-2 border-b bg-gray-50">
                        <span>Subtotal After Discount:</span>
                        <span>₹${(parseFloat(sale.subtotal) - parseFloat(sale.discount_amount)).toFixed(2)}</span>
                    </div>
                    ${sale.cgst_amount > 0 ? `
                        <div class="flex justify-between px-4 py-2 border-b">
                            <span>CGST (9%):</span>
                            <span>₹${parseFloat(sale.cgst_amount).toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between px-4 py-2 border-b">
                            <span>SGST (9%):</span>
                            <span>₹${parseFloat(sale.sgst_amount).toFixed(2)}</span>
                        </div>
                    ` : ''}
                    ${sale.igst_amount > 0 ? `
                        <div class="flex justify-between px-4 py-2 border-b">
                            <span>IGST (18%):</span>
                            <span>₹${parseFloat(sale.igst_amount).toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between px-4 py-2 bg-purple-100 font-bold text-lg">
                        <span>Grand Total:</span>
                        <span>₹${parseFloat(sale.grand_total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="border-t-2 border-gray-300 pt-6 text-xs text-gray-600">
                <p><strong>Payment Mode:</strong> ${sale.payment_mode}</p>
                <p><strong>Status:</strong> ${sale.payment_status.toUpperCase()}</p>
                ${sale.remarks ? `<p><strong>Remarks:</strong> ${sale.remarks}</p>` : ''}
                <p class="mt-4">Thank you for your business!</p>
            </div>
        </div>
    `;

    document.getElementById('invoiceModal').classList.remove('hidden');
    document.getElementById('printInvoiceBtn').classList.remove('hidden');
    document.getElementById('downloadPdfBtn').classList.remove('hidden');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.add('hidden');
}

function printInvoice() {
    const printableArea = document.getElementById('printableInvoice');
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(printableArea.innerHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

function downloadInvoice() {
    if (!currentSale || !currentSale.sale) return;

    const element = document.getElementById('printableInvoice');
    const opt = {
        margin: 10,
        filename: `Invoice-${currentSale.sale.invoice_number}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
}

function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
        return;
    }

    fetch('api/sales.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: saleId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showAlert('Sale deleted successfully', 'success');
                loadSalesList();
                loadAnalytics();
            } else if (data.error) {
                showAlert(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error deleting sale:', error);
            showAlert('Error deleting sale', 'error');
        });
}

// ============================================
// ANALYTICS
// ============================================

function loadAnalytics() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDateStr = new Date().toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    // Load sales for summary
    fetch('api/sales.php?action=list')
        .then(response => response.json())
        .then(data => {
            const sales = data.sales || [];
            
            // Calculate summary
            const totalSales = sales.reduce((sum, s) => sum + parseFloat(s.grand_total), 0);
            const totalProfit = sales.reduce((sum, s) => sum + parseFloat(s.total_profit), 0);
            const totalTransactions = sales.length;
            const uniqueCustomers = new Set(sales.map(s => s.customer_id)).size;

            document.getElementById('analyticsTotalSales').textContent = `₹${totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            document.getElementById('analyticsTotalProfit').textContent = `₹${totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
            document.getElementById('analyticsTotalTransactions').textContent = totalTransactions;
            document.getElementById('analyticsCustomers').textContent = uniqueCustomers;

            // Render charts
            renderAnalyticsCharts(sales);
        })
        .catch(error => {
            console.error('Error loading analytics:', error);
            showAlert('Error loading analytics', 'error');
        });
}

function renderAnalyticsCharts(sales) {
    // Sales Trend Chart
    const salesByDate = {};
    sales.forEach(sale => {
        const date = new Date(sale.sale_date).toLocaleDateString('en-IN');
        salesByDate[date] = (salesByDate[date] || 0) + parseFloat(sale.grand_total);
    });

    const ctx1 = document.getElementById('salesTrendChart').getContext('2d');
    if (charts.salesTrend) charts.salesTrend.destroy();
    charts.salesTrend = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: Object.keys(salesByDate),
            datasets: [{
                label: 'Daily Sales (₹)',
                data: Object.values(salesByDate),
                borderColor: '#9333ea',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Profit Margin Chart
    const profitByDate = {};
    sales.forEach(sale => {
        const date = new Date(sale.sale_date).toLocaleDateString('en-IN');
        profitByDate[date] = (profitByDate[date] || 0) + parseFloat(sale.total_profit);
    });

    const ctx2 = document.getElementById('profitMarginChart').getContext('2d');
    if (charts.profitMargin) charts.profitMargin.destroy();
    charts.profitMargin = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: Object.keys(profitByDate),
            datasets: [{
                label: 'Daily Profit (₹)',
                data: Object.values(profitByDate),
                backgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: { y: { beginAtZero: true } }
        }
    });

    // Customer Type Chart
    const customerTypeCount = {};
    sales.forEach(sale => {
        const type = sale.customer_type || 'Unknown';
        customerTypeCount[type] = (customerTypeCount[type] || 0) + parseFloat(sale.grand_total);
    });

    const ctx3 = document.getElementById('customerTypeChart').getContext('2d');
    if (charts.customerType) charts.customerType.destroy();
    charts.customerType = new Chart(ctx3, {
        type: 'doughnut',
        data: {
            labels: Object.keys(customerTypeCount),
            datasets: [{
                data: Object.values(customerTypeCount),
                backgroundColor: ['#9333ea', '#3b82f6', '#10b981', '#f59e0b']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: true } }
        }
    });

    // Product Performance Chart - Calculate from current sales data
    const productSales = {};
    sales.forEach(sale => {
        // Try to get sales items if available in the sale object
        if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach(item => {
                const key = item.product_name;
                productSales[key] = (productSales[key] || 0) + parseFloat(item.line_subtotal);
            });
        }
    });

    // Render product chart with available data
    const ctx4 = document.getElementById('productChart').getContext('2d');
    if (charts.product) charts.product.destroy();
    
    const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    charts.product = new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: topProducts.map(p => p[0]),
            datasets: [{
                label: 'Sales (₹)',
                data: topProducts.map(p => p[1]),
                backgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: { legend: { display: true } },
            scales: { x: { beginAtZero: true } }
        }
    });
}

// ============================================
// UTILITIES
// ============================================

function showAlert(message, type = 'info') {
    // You can replace this with a better alert system
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 px-6 py-3 ${bgColor} text-white rounded-lg shadow-lg z-50`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
