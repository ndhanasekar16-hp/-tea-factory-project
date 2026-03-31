// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let allOrders = [];
let currentUserData = null;

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Check if user is authenticated
function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    // Get current user data
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUserData = JSON.parse(savedUser);
        updateUserProfile(currentUserData);
    }

    setupEventListeners();
    fetchPurchaseOrders();

    // Apply role-based UI
    if (typeof RoleUtils !== 'undefined') {
        RoleUtils.applyRoleSpecificUI();
    }
});

function updateUserProfile(user) {
    if (!user) return;

    // Header
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRoleDisplay');
    const userInitialsEl = document.getElementById('userInitials');

    if (userNameEl) userNameEl.textContent = user.full_name;
    if (userRoleEl) userRoleEl.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    if (userInitialsEl && user.full_name) {
        userInitialsEl.textContent = user.full_name.charAt(0).toUpperCase();
    }

    // Sidebar
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) userEmailEl.textContent = user.email;
}

// Setup event listeners
function setupEventListeners() {
    // Form toggle
    const toggleBtn = document.getElementById('toggleFormBtn');
    const form = document.getElementById('purchaseOrderForm');

    if (toggleBtn && form) {
        toggleBtn.addEventListener('click', () => {
            form.classList.toggle('hidden');
            const icon = toggleBtn.querySelector('i');
            if (form.classList.contains('hidden')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    }

    // Cost calculation
    const unitPriceInput = document.getElementById('unitPrice');
    const quantityInput = document.getElementById('quantity');

    const calculateCost = () => {
        const price = parseFloat(unitPriceInput.value) || 0;
        const qty = parseFloat(quantityInput.value) || 0;
        const total = price * qty;
        document.getElementById('totalCost').value = total.toFixed(2);
    };

    if (unitPriceInput) unitPriceInput.addEventListener('input', calculateCost);
    if (quantityInput) quantityInput.addEventListener('input', calculateCost);

    // Form submit
    const purchaseForm = document.getElementById('purchaseOrderForm');
    if (purchaseForm) {
        purchaseForm.addEventListener('submit', handleFormSubmit);
    }
}

// API Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(API_BASE_URL + endpoint, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Fetch Purchase Orders
async function fetchPurchaseOrders() {
    try {
        const result = await apiCall('purchase_orders.php', 'GET');

        if (result.purchase_orders) {
            allOrders = result.purchase_orders;
            renderTable(allOrders);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('ordersTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                    <p>Error loading purchase orders. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Render Table
function renderTable(orders) {
    const tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <p>No purchase orders found.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.purchase_date).toLocaleDateString();
        const cost = parseFloat(order.total_cost).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

        let statusColor = 'bg-gray-100 text-gray-800';
        if (order.purchase_status === 'approved') statusColor = 'bg-green-100 text-green-800';
        if (order.purchase_status === 'pending') statusColor = 'bg-yellow-100 text-yellow-800';
        if (order.purchase_status === 'cancelled') statusColor = 'bg-red-100 text-red-800';
        if (order.purchase_status === 'delivered') statusColor = 'bg-blue-100 text-blue-800';

        let deliveryColor = order.delivery_status === 'received' ? 'text-green-600' : 'text-orange-600';
        let deliveryIcon = order.delivery_status === 'received' ? 'fa-check-circle' : 'fa-clock';

        return `
            <tr class="hover:bg-gray-50 transition">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #${order.purchase_id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${date}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${escapeHtml(order.supplier_name)}</div>
                    <div class="text-xs text-gray-500">${escapeHtml(order.supplier_id)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(order.material_name)}
                    <span class="text-xs text-gray-500 block">${order.quantity} units</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${cost}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                        ${order.purchase_status.charAt(0).toUpperCase() + order.purchase_status.slice(1)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm ${deliveryColor}">
                    <i class="fas ${deliveryIcon} mr-1"></i> ${order.delivery_status.charAt(0).toUpperCase() + order.delivery_status.slice(1)}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle Form Submit
async function handleFormSubmit(e) {
    e.preventDefault();

    // Collect data
    const formData = {
        purchase_date: document.getElementById('purchaseDate').value,
        supplier_id: document.getElementById('supplierId').value,
        supplier_name: document.getElementById('supplierName').value,
        supplier_contact: document.getElementById('supplierContact').value,
        supplier_email: document.getElementById('supplierEmail').value,
        supplier_address: document.getElementById('supplierAddress').value,
        material_name: document.getElementById('materialName').value,
        unit_price: document.getElementById('unitPrice').value,
        quantity: document.getElementById('quantity').value,
        total_cost: document.getElementById('totalCost').value,
        purchase_status: document.getElementById('purchaseStatus').value,
        transport_mode: document.getElementById('transportMode').value,
        delivery_status: document.getElementById('deliveryStatus').value,
        delivery_date: document.getElementById('deliveryDate').value || null,
        remarks: document.getElementById('remarks').value
    };

    try {
        const result = await apiCall('purchase_orders.php', 'POST', formData);

        alert('Purchase Order created successfully!');

        // Reset form
        e.target.reset();

        // Refresh list
        fetchPurchaseOrders();

    } catch (error) {
        alert('Error creating order: ' + error.message);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
