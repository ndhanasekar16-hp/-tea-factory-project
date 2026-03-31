// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

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

    // Check role-based access
    if (typeof RoleUtils !== 'undefined' && !RoleUtils.enforcePageAccess()) {
        return;
    }

    // Set default hire date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;

    setupFormListener();
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

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const formData = {
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
        const result = await apiCall('employees.php', 'POST', formData);

        if (result.employee) {
            showMessage('formSuccess', 'Employee added successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = 'employees.html';
            }, 1500);
        }
    } catch (error) {
        showMessage('formError', error.message || 'Failed to add employee. Please try again.');
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

