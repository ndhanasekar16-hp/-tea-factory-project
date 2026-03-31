// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let employees = [];
let attendanceData = {};

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

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;

    setupFormListener();
    loadEmployees();
});

// Setup form listener
function setupFormListener() {
    document.getElementById('attendanceForm').addEventListener('submit', handleSubmit);
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
            employees = result.employees.filter(emp => emp.status === 'active');
            renderEmployees();
        }
    } catch (error) {
        console.error('Error loading employees:', error);
        document.getElementById('employeesList').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                <p>Error loading employees. Please try again.</p>
            </div>
        `;
    }
}

// Render employees list
function renderEmployees() {
    const container = document.getElementById('employeesList');

    if (employees.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-3xl mb-2"></i>
                <p>No active employees found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = employees.map(employee => {
        const employeeId = employee.id;
        const isPresent = attendanceData[employeeId] === 'present';
        const isLeave = attendanceData[employeeId] === 'leave';

        return `
            <div class="employee-card bg-white border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4 flex-1">
                        <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            ${employee.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-semibold text-gray-900">${escapeHtml(employee.full_name)}</div>
                            <div class="text-sm text-gray-600">${escapeHtml(employee.position)}</div>
                            ${employee.department ? `<div class="text-xs text-gray-500">${escapeHtml(employee.department)}</div>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <input type="radio" 
                                   id="present_${employeeId}" 
                                   name="status_${employeeId}" 
                                   value="present"
                                   ${isPresent ? 'checked' : ''}
                                   onchange="updateAttendance(${employeeId}, 'present')"
                                   class="hidden">
                            <label for="present_${employeeId}" 
                                   class="status-option status-present px-4 py-2 rounded-lg cursor-pointer border-2 font-medium transition ${isPresent ? 'bg-green-500 text-white border-green-600' : 'bg-green-50 border-green-200'}"
                                   onclick="updateAttendance(${employeeId}, 'present')">
                                <i class="fas fa-check-circle mr-2"></i>Present
                            </label>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input type="radio" 
                                   id="leave_${employeeId}" 
                                   name="status_${employeeId}" 
                                   value="leave"
                                   ${isLeave ? 'checked' : ''}
                                   onchange="updateAttendance(${employeeId}, 'leave')"
                                   class="hidden">
                            <label for="leave_${employeeId}" 
                                   class="status-option status-leave px-4 py-2 rounded-lg cursor-pointer border-2 font-medium transition ${isLeave ? 'bg-red-500 text-white border-red-600' : 'bg-red-50 border-red-200'}"
                                   onclick="updateAttendance(${employeeId}, 'leave')">
                                <i class="fas fa-times-circle mr-2"></i>Leave
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Update attendance for an employee
function updateAttendance(employeeId, status) {
    attendanceData[employeeId] = status;

    // Update radio button state
    document.getElementById(`present_${employeeId}`).checked = status === 'present';
    document.getElementById(`leave_${employeeId}`).checked = status === 'leave';

    // Update visual state
    const presentLabel = document.querySelector(`label[for="present_${employeeId}"]`);
    const leaveLabel = document.querySelector(`label[for="leave_${employeeId}"]`);

    if (status === 'present') {
        presentLabel.classList.add('bg-green-500', 'text-white', 'border-green-600');
        presentLabel.classList.remove('bg-green-50', 'border-green-200');
        leaveLabel.classList.remove('bg-red-500', 'text-white', 'border-red-600');
        leaveLabel.classList.add('bg-red-50', 'border-red-200');
    } else {
        leaveLabel.classList.add('bg-red-500', 'text-white', 'border-red-600');
        leaveLabel.classList.remove('bg-red-50', 'border-red-200');
        presentLabel.classList.remove('bg-green-500', 'text-white', 'border-green-600');
        presentLabel.classList.add('bg-green-50', 'border-green-200');
    }
}

// Mark all as present
function markAllPresent() {
    employees.forEach(employee => {
        updateAttendance(employee.id, 'present');
    });
}

// Mark all as leave
function markAllLeave() {
    employees.forEach(employee => {
        updateAttendance(employee.id, 'leave');
    });
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const date = document.getElementById('attendanceDate').value;

    if (!date) {
        showMessage('formError', 'Please select a date');
        return;
    }

    if (Object.keys(attendanceData).length === 0) {
        showMessage('formError', 'Please mark attendance for at least one employee');
        return;
    }

    showLoading();
    hideMessage('formError');
    hideMessage('formSuccess');

    try {
        // Save attendance for each employee
        const results = [];

        for (const employeeId of Object.keys(attendanceData)) {
            const status = attendanceData[employeeId];
            const payload = {
                employee_id: parseInt(employeeId),
                attendance_date: date,
                status: status === 'present' ? 'present' : 'absent',
                notes: ''
            };

            try {
                // Try to create new record
                const result = await apiCall('attendance.php', 'POST', payload);
                results.push(result);
            } catch (error) {
                // If attendance already exists, get the record and update it
                if (error.message.includes('already recorded') || error.message.includes('already exists')) {
                    try {
                        // First, get the existing record
                        const existingRecords = await apiCall(`attendance.php?employee_id=${employeeId}&date=${date}`, 'GET');

                        if (existingRecords.attendance && existingRecords.attendance.id) {
                            // Update existing record
                            const updateResult = await apiCall('attendance.php', 'PATCH', {
                                id: existingRecords.attendance.id,
                                status: status === 'present' ? 'present' : 'absent',
                                notes: ''
                            });
                            results.push(updateResult);
                        } else {
                            throw new Error('Could not find existing attendance record');
                        }
                    } catch (updateError) {
                        console.error(`Error updating attendance for employee ${employeeId}:`, updateError);
                        throw updateError;
                    }
                } else {
                    throw error;
                }
            }
        }

        showMessage('formSuccess', 'Attendance saved successfully! Redirecting...');

        setTimeout(() => {
            window.location.href = 'attendance.html';
        }, 1500);
    } catch (error) {
        console.error('Error saving attendance:', error);
        showMessage('formError', error.message || 'Failed to save attendance. Please try again.');
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

