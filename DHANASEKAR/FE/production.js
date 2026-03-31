// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allProductions = [];
let filteredProductions = [];

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

    setupProductionEventListeners();
    loadProductions();
});

// Setup event listeners
function setupProductionEventListeners() {
    const form = document.getElementById('productionForm');
    if (form) {
        form.addEventListener('submit', handleProductionSubmit);
    }

    const applyBtn = document.getElementById('applyProductionFiltersBtn');
    const resetBtn = document.getElementById('resetProductionFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const date = document.getElementById('filterProductionDate').value;
            const leafType = document.getElementById('filterLeafType').value;
            const quality = document.getElementById('filterProductionQuality').value;
            loadProductions({ date, leaf_type: leafType, production_quality: quality });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterProductionDate').value = '';
            document.getElementById('filterLeafType').value = '';
            document.getElementById('filterProductionQuality').value = '';
            loadProductions();
        });
    }

    // Set default date in form to today
    const dateInput = document.getElementById('productionDate');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// API Helper
async function productionApiCall(endpoint, method = 'GET', body = null) {
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

// Load productions with optional filters
async function loadProductions(filters = {}) {
    const tbody = document.getElementById('productionTableBody');
    const emptyState = document.getElementById('productionEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading production records...</p>
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
        if (filters.date) params.append('production_date', filters.date);
        if (filters.leaf_type) params.append('leaf_type', filters.leaf_type);
        if (filters.production_quality) params.append('production_quality', filters.production_quality);

        const endpoint = 'production.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await productionApiCall(endpoint, 'GET');

        allProductions = result.productions || [];
        filteredProductions = [...allProductions];
        renderProductions();
    } catch (error) {
        console.error('Error loading productions:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading production records. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderProductions() {
    const tbody = document.getElementById('productionTableBody');
    const emptyState = document.getElementById('productionEmptyState');

    if (!tbody) return;

    if (!filteredProductions.length) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    tbody.innerHTML = filteredProductions.map(item => {
        const date = item.production_date
            ? new Date(item.production_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : '-';

        const qualityColors = {
            A: 'bg-green-100 text-green-800',
            B: 'bg-blue-100 text-blue-800',
            C: 'bg-yellow-100 text-yellow-800',
            D: 'bg-red-100 text-red-800'
        };

        const qualityClass = qualityColors[item.production_quality] || 'bg-gray-100 text-gray-800';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.production_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${date}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.leaf_type || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.production_quantity_kg || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.production_cost || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold ${qualityClass}">
                        ${item.production_quality}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.operator_id || '')}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleProductionSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('productionDate').value;
    const operatorId = document.getElementById('operatorId').value.trim();
    const leafType = document.getElementById('leafType').value;
    const quantity = document.getElementById('productionQuantity').value;
    const cost = document.getElementById('productionCost').value;
    const quality = document.getElementById('productionQuality').value;
    const remarks = document.getElementById('productionRemarks').value.trim();

    const errorEl = document.getElementById('productionError');
    const successEl = document.getElementById('productionSuccess');
    const submitText = document.getElementById('productionSubmitText');
    const submitLoader = document.getElementById('productionSubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    if (!date || !operatorId || !leafType || !quantity || !cost || !quality) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    const qtyValue = parseFloat(quantity);
    const costValue = parseFloat(cost);

    if (isNaN(qtyValue) || qtyValue <= 0) {
        if (errorEl) {
            errorEl.textContent = 'Production quantity must be a positive number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(costValue) || costValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Production cost must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            production_date: date,
            production_cost: costValue,
            operator_id: operatorId,
            leaf_type: leafType,
            production_quantity_kg: qtyValue,
            production_quality: quality,
            remarks: remarks || null
        };

        const result = await productionApiCall('production.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Production record saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except date and leaf type
        document.getElementById('operatorId').value = '';
        document.getElementById('productionQuantity').value = '';
        document.getElementById('productionCost').value = '';
        document.getElementById('productionQuality').value = '';
        document.getElementById('productionRemarks').value = '';

        await loadProductions();
    } catch (error) {
        console.error('Error saving production:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save production record.';
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



