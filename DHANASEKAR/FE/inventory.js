// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allInventory = [];
let filteredInventory = [];

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

    setupInventoryEventListeners();
    loadInventory();
});

// Setup event listeners
function setupInventoryEventListeners() {
    const form = document.getElementById('inventoryForm');
    if (form) {
        form.addEventListener('submit', handleInventorySubmit);
    }

    const applyBtn = document.getElementById('applyInventoryFiltersBtn');
    const resetBtn = document.getElementById('resetInventoryFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const teaType = document.getElementById('filterTeaType').value;
            const grade = document.getElementById('filterGrade').value;
            loadInventory({ tea_type: teaType, grade: grade });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterTeaType').value = '';
            document.getElementById('filterGrade').value = '';
            loadInventory();
        });
    }

    // Set default packing date to today
    const packingDateInput = document.getElementById('packingDate');
    if (packingDateInput && !packingDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        packingDateInput.value = today;
    }
}

// API Helper
async function inventoryApiCall(endpoint, method = 'GET', body = null) {
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

// Load inventory with optional filters
async function loadInventory(filters = {}) {
    const tbody = document.getElementById('inventoryTableBody');
    const emptyState = document.getElementById('inventoryEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading inventory...</p>
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
        if (filters.tea_type) params.append('tea_type', filters.tea_type);
        if (filters.grade) params.append('grade', filters.grade);

        const endpoint = 'inventory.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await inventoryApiCall(endpoint, 'GET');

        allInventory = result.inventory || [];
        filteredInventory = [...allInventory];
        renderInventory();
    } catch (error) {
        console.error('Error loading inventory:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading inventory. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    const emptyState = document.getElementById('inventoryEmptyState');

    if (!tbody) return;

    if (!filteredInventory.length) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    tbody.innerHTML = filteredInventory.map(item => {
        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.inventory_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.product_name || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.product_code || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.tea_type || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        ${escapeHtml(item.grade || '')}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.current_stock_kg || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.storage_location || '-')}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleInventorySubmit(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value.trim();
    const productCode = document.getElementById('productCode').value.trim();
    const packingDate = document.getElementById('packingDate').value;
    const expiredDate = document.getElementById('expiredDate').value;
    const teaType = document.getElementById('teaType').value;
    const grade = document.getElementById('grade').value;
    const storageCondition = document.getElementById('storageCondition').value;
    const temperature = document.getElementById('temperature').value;
    const storageLocation = document.getElementById('storageLocation').value.trim();
    const openingStock = document.getElementById('openingStock').value;
    const currentStock = document.getElementById('currentStock').value;
    const damagedStock = document.getElementById('damagedStock').value;
    const totalStockValue = document.getElementById('totalStockValue').value;
    const sellingPrice = document.getElementById('sellingPrice').value;
    const costPerKg = document.getElementById('costPerKg').value;
    const usedIn = document.getElementById('usedIn').value.trim();
    const remarks = document.getElementById('remarks').value.trim();

    const errorEl = document.getElementById('inventoryError');
    const successEl = document.getElementById('inventorySuccess');
    const submitText = document.getElementById('inventorySubmitText');
    const submitLoader = document.getElementById('inventorySubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    // Validate required fields
    if (!productName || !productCode || !packingDate || !teaType || !grade || !storageCondition ||
        !openingStock || !currentStock || !damagedStock || !totalStockValue || !sellingPrice || !costPerKg) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    // Validate numeric fields
    const openingStockValue = parseFloat(openingStock);
    const currentStockValue = parseFloat(currentStock);
    const damagedStockValue = parseFloat(damagedStock);
    const totalStockValueNum = parseFloat(totalStockValue);
    const sellingPriceNum = parseFloat(sellingPrice);
    const costPerKgNum = parseFloat(costPerKg);
    const temperatureNum = temperature ? parseFloat(temperature) : null;

    if (isNaN(openingStockValue) || openingStockValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Opening stock must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(currentStockValue) || currentStockValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Current stock must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(damagedStockValue) || damagedStockValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Damaged stock must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(totalStockValueNum) || totalStockValueNum < 0) {
        if (errorEl) {
            errorEl.textContent = 'Total stock value must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum < 0) {
        if (errorEl) {
            errorEl.textContent = 'Selling price must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(costPerKgNum) || costPerKgNum < 0) {
        if (errorEl) {
            errorEl.textContent = 'Cost per kg must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            product_name: productName,
            product_code: productCode,
            packing_date: packingDate,
            expired_date: expiredDate || null,
            tea_type: teaType,
            grade: grade,
            storage_condition: storageCondition,
            temperature: temperatureNum,
            storage_location: storageLocation || null,
            opening_stock_kg: openingStockValue,
            current_stock_kg: currentStockValue,
            damaged_stock_kg: damagedStockValue,
            total_stock_value: totalStockValueNum,
            selling_price: sellingPriceNum,
            cost_per_kg: costPerKgNum,
            used_in: usedIn || null,
            remarks: remarks || null
        };

        const result = await inventoryApiCall('inventory.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Inventory item saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except packing date
        document.getElementById('productName').value = '';
        document.getElementById('productCode').value = '';
        document.getElementById('expiredDate').value = '';
        document.getElementById('teaType').value = '';
        document.getElementById('grade').value = '';
        document.getElementById('storageCondition').value = '';
        document.getElementById('temperature').value = '';
        document.getElementById('storageLocation').value = '';
        document.getElementById('openingStock').value = '';
        document.getElementById('currentStock').value = '';
        document.getElementById('damagedStock').value = '';
        document.getElementById('totalStockValue').value = '';
        document.getElementById('sellingPrice').value = '';
        document.getElementById('costPerKg').value = '';
        document.getElementById('usedIn').value = '';
        document.getElementById('remarks').value = '';

        await loadInventory();
    } catch (error) {
        console.error('Error saving inventory:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save inventory item.';
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


