// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allSuppliers = [];
let filteredSuppliers = [];

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

    setupSupplierEventListeners();
    loadSuppliers();
});

// Setup event listeners
function setupSupplierEventListeners() {
    const form = document.getElementById('supplierForm');
    if (form) {
        form.addEventListener('submit', handleSupplierSubmit);
    }

    const applyBtn = document.getElementById('applySupplierFiltersBtn');
    const resetBtn = document.getElementById('resetSupplierFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const status = document.getElementById('filterSupplierStatus').value;
            const type = document.getElementById('filterSupplierType').value;
            loadSuppliers({ suppliers_status: status, supplier_type: type });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterSupplierStatus').value = '';
            document.getElementById('filterSupplierType').value = '';
            loadSuppliers();
        });
    }

    // Set default supply date to today
    const supplyDateInput = document.getElementById('supplyDate');
    if (supplyDateInput && !supplyDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        supplyDateInput.value = today;
    }
}

// API Helper
async function supplierApiCall(endpoint, method = 'GET', body = null) {
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

    const response = await fetch(API_BASE_URL + endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Load suppliers with optional filters
async function loadSuppliers(filters = {}) {
    const tbody = document.getElementById('supplierTableBody');
    const emptyState = document.getElementById('supplierEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading supplier records...</p>
                    </div>
                </td>
            </tr>
        `;
    }
    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    try {
        const params = new URLSearchParams();
        if (filters.suppliers_status) params.append('suppliers_status', filters.suppliers_status);
        if (filters.supplier_type) params.append('supplier_type', filters.supplier_type);

        const endpoint = 'suppliers.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await supplierApiCall(endpoint, 'GET');

        allSuppliers = result.suppliers || [];
        filteredSuppliers = [...allSuppliers];
        renderSuppliers();
    } catch (error) {
        console.error('Error loading suppliers:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading supplier records. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderSuppliers() {
    const tbody = document.getElementById('supplierTableBody');
    const emptyState = document.getElementById('supplierEmptyState');

    if (!tbody) return;

    if (!filteredSuppliers.length) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    const statusColors = {
        'active': 'bg-green-100 text-green-800',
        'inactive': 'bg-red-100 text-red-800'
    };

    tbody.innerHTML = filteredSuppliers.map(item => {
        const statusClass = statusColors[item.suppliers_status] || 'bg-gray-100 text-gray-800';
        const statusText = item.suppliers_status || '-';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.supply_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.supplier_name || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.contact_person || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.email_id || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.supplier_type || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.quantity || 0).toFixed(2)}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleSupplierSubmit(e) {
    e.preventDefault();

    const supplierId = document.getElementById('supplierId').value.trim();
    const supplierName = document.getElementById('supplierName').value.trim();
    const contactPerson = document.getElementById('contactPerson').value.trim();
    const emailId = document.getElementById('emailId').value.trim();
    const address = document.getElementById('address').value.trim();
    const location = document.getElementById('location').value.trim();
    const supplyDate = document.getElementById('supplyDate').value;
    const gstNo = document.getElementById('gstNo').value.trim();
    const inspectionDate = document.getElementById('inspectionDate').value.trim();
    const pricePerKg = document.getElementById('pricePerKg').value;
    const contractId = document.getElementById('contractId').value.trim();
    const contractStatus = document.getElementById('contractStatus').value.trim();
    const quantity = document.getElementById('quantity').value;
    const supplierType = document.getElementById('supplierType').value;
    const itemSupplied = document.getElementById('itemSupplied').value;
    const supplyFrequency = document.getElementById('supplyFrequency').value;
    const suppliersStatus = document.getElementById('suppliersStatus').value;
    const suppliersWork = document.getElementById('suppliersWork').value;
    const remarks = document.getElementById('remarks').value.trim();

    const errorEl = document.getElementById('supplierError');
    const successEl = document.getElementById('supplierSuccess');
    const submitText = document.getElementById('supplierSubmitText');
    const submitLoader = document.getElementById('supplierSubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    // Validate required fields
    if (!supplierId || !supplierName || !contactPerson || !emailId || !address || !location ||
        !supplyDate || !pricePerKg || !quantity || !supplierType || !itemSupplied ||
        !supplyFrequency || !suppliersStatus || !suppliersWork) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId)) {
        if (errorEl) {
            errorEl.textContent = 'Please enter a valid email address.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    // Validate numeric fields
    const pricePerKgValue = parseFloat(pricePerKg);
    const quantityValue = parseFloat(quantity);

    if (isNaN(pricePerKgValue) || pricePerKgValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Price per kg must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(quantityValue) || quantityValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Quantity must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            supplier_id: supplierId,
            supplier_name: supplierName,
            contact_person: contactPerson,
            email_id: emailId,
            address: address,
            location: location,
            supply_date: supplyDate,
            gst_no: gstNo || null,
            inspection_date: inspectionDate || null,
            price_per_kg: pricePerKgValue,
            contract_id: contractId || null,
            contract_status: contractStatus || null,
            quantity: quantityValue,
            supplier_type: supplierType,
            item_supplied: itemSupplied,
            supply_frequency: supplyFrequency,
            suppliers_status: suppliersStatus,
            suppliers_work: suppliersWork,
            remarks: remarks || null
        };

        const result = await supplierApiCall('suppliers.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Supplier saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except supply date
        document.getElementById('supplierId').value = '';
        document.getElementById('supplierName').value = '';
        document.getElementById('contactPerson').value = '';
        document.getElementById('emailId').value = '';
        document.getElementById('address').value = '';
        document.getElementById('location').value = '';
        document.getElementById('gstNo').value = '';
        document.getElementById('inspectionDate').value = '';
        document.getElementById('pricePerKg').value = '';
        document.getElementById('contractId').value = '';
        document.getElementById('contractStatus').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('supplierType').value = '';
        document.getElementById('itemSupplied').value = '';
        document.getElementById('supplyFrequency').value = '';
        document.getElementById('suppliersStatus').value = '';
        document.getElementById('suppliersWork').value = '';
        document.getElementById('remarks').value = '';

        await loadSuppliers();
    } catch (error) {
        console.error('Error saving supplier:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save supplier.';
            errorEl.classList.remove('hidden');
        }
    } finally {
        if (submitText) submitText.classList.remove('hidden');
        if (submitLoader) submitLoader.classList.add('hidden');
    }
}

// Simple escape helper
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}


