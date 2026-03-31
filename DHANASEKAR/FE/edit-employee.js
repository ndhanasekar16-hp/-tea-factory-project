// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let employeeId = null;
let employeeData = null;

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

// Get employee ID from URL
function getEmployeeIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? parseInt(id) : null;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    // Check role-based access
    if (typeof RoleUtils !== 'undefined' && !RoleUtils.enforcePageAccess()) {
        return;
    }

    employeeId = getEmployeeIdFromUrl();
    if (!employeeId) {
        showError('Employee ID is required');
        return;
    }

    setupFormListener();
    loadEmployeeData();
});

// Setup form listener
function setupFormListener() {
    document.getElementById('employeeForm').addEventListener('submit', handleSubmit);
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

// Load employee data
async function loadEmployeeData() {
    try {
        const result = await apiCall(`employees.php?id=${employeeId}`, 'GET');

        if (result.employee) {
            employeeData = result.employee;
            populateForm();
            document.getElementById('loadingState').classList.add('hidden');
            document.getElementById('employeeFormContainer').classList.remove('hidden');
        } else {
            showError('Employee not found');
        }
    } catch (error) {
        console.error('Error loading employee:', error);
        showError(error.message || 'Failed to load employee data');
    }
}

// Populate form with employee data
function populateForm() {
    if (!employeeData) return;

    document.getElementById('fullName').value = employeeData.full_name || '';
    document.getElementById('email').value = employeeData.email || '';
    document.getElementById('phone').value = employeeData.phone || '';
    document.getElementById('position').value = employeeData.position || '';
    document.getElementById('department').value = employeeData.department || '';
    document.getElementById('hireDate').value = employeeData.hire_date || '';
    document.getElementById('salary').value = employeeData.salary || '';
    document.getElementById('status').value = employeeData.status || 'active';
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
        id: employeeId,
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        position: document.getElementById('position').value.trim(),
        department: document.getElementById('department').value.trim(),
        hire_date: document.getElementById('hireDate').value,
        salary: document.getElementById('salary').value ? parseFloat(document.getElementById('salary').value) : null,
        status: document.getElementById('status').value
    };

    // Validate required fields
    if (!formData.full_name || !formData.email || !formData.position || !formData.hire_date) {
        showMessage('formError', 'Please fill in all required fields');
        return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        document.getElementById('emailError').classList.remove('hidden');
        return;
    } else {
        document.getElementById('emailError').classList.add('hidden');
    }

    showLoading();
    hideMessage('formError');
    hideMessage('formSuccess');

    try {
        const result = await apiCall('employees.php', 'PUT', formData);

        if (result.employee) {
            showMessage('formSuccess', 'Employee updated successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = 'employees.html';
            }, 1500);
        }
    } catch (error) {
        showMessage('formError', error.message || 'Failed to update employee. Please try again.');
    } finally {
        hideLoading();
    }
}

// UI Helpers
function showLoading() {
    document.getElementById('submitBtnText').classList.add('hidden');
    document.getElementById('submitLoader').classList.remove('hidden');
    document.getElementById('submitBtn').disabled = true;
}

function hideLoading() {
    document.getElementById('submitBtnText').classList.remove('hidden');
    document.getElementById('submitLoader').classList.add('hidden');
    document.getElementById('submitBtn').disabled = false;
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');

    if (elementId === 'formSuccess') {
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000);
    }
}

function hideMessage(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// Show error state
function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('employeeFormContainer').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
}

