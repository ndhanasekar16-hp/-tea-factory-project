// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allQualityRecords = [];
let filteredQualityRecords = [];

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

    setupQualityEventListeners();
    loadQualityRecords();
});

// Setup event listeners
function setupQualityEventListeners() {
    const form = document.getElementById('qualityForm');
    if (form) {
        form.addEventListener('submit', handleQualitySubmit);
    }

    const applyBtn = document.getElementById('applyQualityFiltersBtn');
    const resetBtn = document.getElementById('resetQualityFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const status = document.getElementById('filterQualityStatus').value;
            loadQualityRecords({ quality_status: status });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterQualityStatus').value = '';
            loadQualityRecords();
        });
    }

    // Set default production date to today
    const productionDateInput = document.getElementById('productionDate');
    if (productionDateInput && !productionDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        productionDateInput.value = today;
    }
}

// API Helper
async function qualityApiCall(endpoint, method = 'GET', body = null) {
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

// Load quality records with optional filters
async function loadQualityRecords(filters = {}) {
    const tbody = document.getElementById('qualityTableBody');
    const emptyState = document.getElementById('qualityEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading quality records...</p>
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
        if (filters.quality_status) params.append('quality_status', filters.quality_status);

        const endpoint = 'quality.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await qualityApiCall(endpoint, 'GET');

        allQualityRecords = result.quality || [];
        filteredQualityRecords = [...allQualityRecords];
        renderQualityRecords();
    } catch (error) {
        console.error('Error loading quality records:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading quality records. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderQualityRecords() {
    const tbody = document.getElementById('qualityTableBody');
    const emptyState = document.getElementById('qualityEmptyState');

    if (!tbody) return;

    if (!filteredQualityRecords.length) {
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
        'approved': 'bg-green-100 text-green-800',
        'hold': 'bg-yellow-100 text-yellow-800',
        'Reprocess': 'bg-blue-100 text-blue-800',
        'rejected': 'bg-red-100 text-red-800'
    };

    tbody.innerHTML = filteredQualityRecords.map(item => {
        const productionDate = item.production_date
            ? new Date(item.production_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : '-';

        const statusClass = statusColors[item.quality_status] || 'bg-gray-100 text-gray-800';
        const statusText = item.quality_status || '-';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.quality_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.batch_no || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${productionDate}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.checked_by || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.color_ || '-')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.aroma || '-')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.taste || '-')}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleQualitySubmit(e) {
    e.preventDefault();

    const batchNo = document.getElementById('batchNo').value.trim();
    const productionDate = document.getElementById('productionDate').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const checkedBy = document.getElementById('checkedBy').value.trim();
    const qualityStandardNo = document.getElementById('qualityStandardNo').value.trim();
    const moistureInPercentage = document.getElementById('moistureInPercentage').value.trim();
    const qualityStatus = document.getElementById('qualityStatus').value;
    const color = document.getElementById('color').value;
    const aroma = document.getElementById('aroma').value;
    const taste = document.getElementById('taste').value;

    const errorEl = document.getElementById('qualityError');
    const successEl = document.getElementById('qualitySuccess');
    const submitText = document.getElementById('qualitySubmitText');
    const submitLoader = document.getElementById('qualitySubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    // Validate required fields
    if (!batchNo || !productionDate || !checkedBy || !qualityStandardNo || 
        !moistureInPercentage || !qualityStatus || !color || !aroma || !taste) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            batch_no: batchNo,
            production_date: productionDate,
            expiry_date: expiryDate || null,
            checked_by: checkedBy,
            quality_standard_no: qualityStandardNo,
            moisture_in_percentage: moistureInPercentage,
            quality_status: qualityStatus,
            color_: color,
            aroma: aroma,
            taste: taste
        };

        const result = await qualityApiCall('quality.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Quality check saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except production date
        document.getElementById('batchNo').value = '';
        document.getElementById('expiryDate').value = '';
        document.getElementById('checkedBy').value = '';
        document.getElementById('qualityStandardNo').value = '';
        document.getElementById('moistureInPercentage').value = '';
        document.getElementById('qualityStatus').value = '';
        document.getElementById('color').value = '';
        document.getElementById('aroma').value = '';
        document.getElementById('taste').value = '';

        await loadQualityRecords();
    } catch (error) {
        console.error('Error saving quality record:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save quality check.';
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


