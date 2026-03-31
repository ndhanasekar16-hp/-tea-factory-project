// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let allEmployees = [];
let filteredEmployees = [];
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
    }

    setupEventListeners();
    loadEmployees();

    // Apply role-based UI
    if (typeof RoleUtils !== 'undefined') {
        RoleUtils.applyRoleSpecificUI();
    }
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
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

// Load employees
async function loadEmployees() {
    try {
        const result = await apiCall('employees.php', 'GET');

        if (result.employees) {
            allEmployees = result.employees;

            // Filter for user role - only show their own data
            let currentRole = null;
            if (typeof RoleUtils !== 'undefined') {
                currentRole = RoleUtils.getUserRole();
            } else if (currentUserData && currentUserData.role) {
                currentRole = currentUserData.role.toLowerCase().trim();
            }

            if ((currentRole === 'employee' || currentRole === 'user') && currentUserData) {
                allEmployees = allEmployees.filter(emp =>
                    emp.email.toLowerCase() === currentUserData.email.toLowerCase()
                );
            }

            filteredEmployees = [...allEmployees];
            updateStats();
            renderEmployees();
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        document.getElementById('employeesTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                    <p>Error loading employees. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Update statistics
function updateStats() {
    const total = allEmployees.length;
    const active = allEmployees.filter(emp => emp.status === 'active').length;
    const inactive = allEmployees.filter(emp => emp.status === 'inactive' || emp.status === 'on_leave').length;
    const totalSalary = allEmployees.reduce((sum, emp) => {
        return sum + (parseFloat(emp.salary) || 0);
    }, 0);

    document.getElementById('totalEmployees').textContent = total;
    document.getElementById('activeEmployees').textContent = active;
    document.getElementById('inactiveEmployees').textContent = inactive;
    document.getElementById('totalSalary').textContent = '$' + totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Check if current user can edit/delete employees
function canEditDelete() {
    if (!currentUserData) return false;

    // Use RoleUtils if available
    if (typeof RoleUtils !== 'undefined') {
        return RoleUtils.hasPermission('canEditEmployee');
    }

    // Fallback: admin and manager can edit, user cannot
    return currentUserData.role === 'admin' || currentUserData.role === 'manager';
}

// Render employees table
function renderEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredEmployees.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    tbody.innerHTML = filteredEmployees.map(employee => {
        const hireDate = new Date(employee.hire_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const salary = employee.salary
            ? '$' + parseFloat(employee.salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'N/A';

        const statusClass = employee.status === 'active'
            ? 'status-active'
            : employee.status === 'on_leave'
                ? 'status-on-leave'
                : 'status-inactive';

        const statusText = employee.status === 'active'
            ? 'Active'
            : employee.status === 'on_leave'
                ? 'On Leave'
                : 'Inactive';

        return `
            <tr class="employee-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${employee.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(employee.full_name)}</div>
                            <div class="text-sm text-gray-500">${escapeHtml(employee.email)}</div>
                            ${employee.phone ? `<div class="text-xs text-gray-400">${escapeHtml(employee.phone)}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(employee.position)}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${escapeHtml(employee.department || 'N/A')}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${hireDate}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${salary}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="viewEmployee(${employee.id})" 
                            class="action-btn bg-blue-100 text-blue-700 hover:bg-blue-200 mr-2">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    ${canEditDelete() ? `
                    <button onclick="editEmployee(${employee.id})" 
                            class="action-btn bg-green-100 text-green-700 hover:bg-green-200 mr-2">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteEmployee(${employee.id})" 
                            class="action-btn bg-red-100 text-red-700 hover:bg-red-200">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    applyFilters(searchTerm);
}

// Handle filter
function handleFilter(e) {
    applyFilters();
}

// Apply filters
function applyFilters(searchTerm = null) {
    const statusFilter = document.getElementById('statusFilter').value;
    const search = searchTerm !== null ? searchTerm : document.getElementById('searchInput').value.toLowerCase();

    filteredEmployees = allEmployees.filter(employee => {
        const matchesSearch = !search ||
            employee.full_name.toLowerCase().includes(search) ||
            employee.email.toLowerCase().includes(search) ||
            employee.position.toLowerCase().includes(search) ||
            (employee.department && employee.department.toLowerCase().includes(search));

        const matchesStatus = !statusFilter || employee.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderEmployees();
}

// View employee
function viewEmployee(id) {
    window.location.href = `view-employee.html?id=${id}`;
}

// Edit employee
function editEmployee(id) {
    window.location.href = `edit-employee.html?id=${id}`;
}

// Delete employee
async function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) {
        return;
    }

    try {
        await apiCall('employees.php', 'DELETE', { id: id });
        loadEmployees(); // Reload the list
    } catch (error) {
        alert('Error deleting employee: ' + error.message);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}
