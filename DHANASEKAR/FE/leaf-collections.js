// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allLeafCollections = [];
let filteredLeafCollections = [];

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

    setupLeafCollectionsEventListeners();
    loadLeafCollections();

    // Apply role-based UI
    if (typeof RoleUtils !== 'undefined') {
        RoleUtils.applyRoleSpecificUI();
    }
});

// Setup event listeners
function setupLeafCollectionsEventListeners() {
    const form = document.getElementById('leafCollectionForm');
    if (form) {
        form.addEventListener('submit', handleLeafCollectionSubmit);
    }

    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const date = document.getElementById('filterDate').value;
            const grade = document.getElementById('filterGrade').value;
            loadLeafCollections({ date, grade });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterDate').value = '';
            document.getElementById('filterGrade').value = '';
            loadLeafCollections();
        });
    }

    // Set default date in form to today
    const dateInput = document.getElementById('collectionDate');
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// API Helper
async function leafApiCall(endpoint, method = 'GET', body = null) {
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

// Load leaf collections with optional filters
async function loadLeafCollections(filters = {}) {
    const tbody = document.getElementById('leafCollectionsTableBody');
    const emptyState = document.getElementById('leafCollectionsEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading leaf collections...</p>
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
        if (filters.date) params.append('date', filters.date);
        if (filters.grade) params.append('grade', filters.grade);
        
        if (typeof RoleUtils !== 'undefined' && RoleUtils.shouldFilterToCurrentUser()) {
            const currentUser = RoleUtils.getCurrentUser();
            if (currentUser) {
                params.append('employee_id', currentUser.id);
            }
        }

        const endpoint = 'leaf_collections.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await leafApiCall(endpoint, 'GET');

        allLeafCollections = result.leaf_collections || [];
        filteredLeafCollections = [...allLeafCollections];
        renderLeafCollections();
    } catch (error) {
        console.error('Error loading leaf collections:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading leaf collections. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderLeafCollections() {
    const tbody = document.getElementById('leafCollectionsTableBody');
    const emptyState = document.getElementById('leafCollectionsEmptyState');

    if (!tbody) return;

    if (!filteredLeafCollections.length) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    tbody.innerHTML = filteredLeafCollections.map(item => {
        const date = item.collection_date
            ? new Date(item.collection_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : '-';

        const gradeColors = {
            A: 'bg-green-100 text-green-800',
            B: 'bg-blue-100 text-blue-800',
            C: 'bg-yellow-100 text-yellow-800',
            D: 'bg-red-100 text-red-800'
        };

        const gradeClass = gradeColors[item.leaf_grade] || 'bg-gray-100 text-gray-800';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${date}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.bought_from || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.farmer_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.farmer_contact || '-')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.leaf_quantity_kg || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold ${gradeClass}">
                        ${item.leaf_grade}
                    </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.farmer_location || '-')}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleLeafCollectionSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('collectionDate').value;
    const boughtFrom = document.getElementById('boughtFrom').value.trim();
    const farmerContact = document.getElementById('farmerContact').value.trim();
    const quantity = document.getElementById('leafQuantity').value;
    const grade = document.getElementById('leafGrade').value;
    const location = document.getElementById('farmerLocation').value.trim();

    const errorEl = document.getElementById('leafCollectionError');
    const successEl = document.getElementById('leafCollectionSuccess');
    const submitText = document.getElementById('leafCollectionSubmitText');
    const submitLoader = document.getElementById('leafCollectionSubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    if (!date || !boughtFrom || !quantity || !grade) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields (Date, Bought From, Quantity, Grade).';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    const qtyValue = parseFloat(quantity);
    if (isNaN(qtyValue) || qtyValue <= 0) {
        if (errorEl) {
            errorEl.textContent = 'Leaf quantity must be a positive number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            collection_date: date,
            bought_from: boughtFrom,
            farmer_contact: farmerContact || null,
            leaf_quantity_kg: qtyValue,
            leaf_grade: grade,
            farmer_location: location || null
        };

        const result = await leafApiCall('leaf_collections.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Leaf collection saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except date (keep today)
        document.getElementById('boughtFrom').value = '';
        document.getElementById('farmerContact').value = '';
        document.getElementById('leafQuantity').value = '';
        document.getElementById('leafGrade').value = '';
        document.getElementById('farmerLocation').value = '';

        // Reload list
        await loadLeafCollections();
    } catch (error) {
        console.error('Error saving leaf collection:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save leaf collection.';
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
