// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let employeeId = null;
let employeeData = null;
let attendanceRecords = [];

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

    employeeId = getEmployeeIdFromUrl();
    if (!employeeId) {
        showError('Employee ID is required');
        return;
    }

    loadEmployeeDetails();
    loadAttendance();
});

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

// Load employee details
async function loadEmployeeDetails() {
    try {
        const result = await apiCall(`employees.php?id=${employeeId}`, 'GET');

        if (result.employee) {
            employeeData = result.employee;

            // Check if user is allowed to view this profile
            if (typeof RoleUtils !== 'undefined') {
                const currentUser = RoleUtils.getCurrentUser();
                if (currentUser && currentUser.role === 'employee') {
                    // Employees can only view their own profile
                    if (employeeData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
                        alert('You are not authorized to view this profile.');
                        window.location.href = 'employee-dashboard.html';
                        return;
                    }
                }
            }

            renderEmployeeDetails();
        } else {
            showError('Employee not found');
        }
    } catch (error) {
        console.error('Error loading employee:', error);
        showError(error.message || 'Failed to load employee details');
    }
}

// Render employee details
function renderEmployeeDetails() {
    if (!employeeData) return;

    const name = employeeData.full_name || '-';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    document.getElementById('employeeAvatar').textContent = initials;
    document.getElementById('employeeName').textContent = name;
    document.getElementById('employeePosition').textContent = employeeData.position || '-';
    document.getElementById('employeeDepartment').textContent = employeeData.department || 'N/A';
    document.getElementById('employeeEmail').textContent = employeeData.email || '-';
    document.getElementById('employeePhone').textContent = employeeData.phone || 'N/A';
    document.getElementById('employeeId').textContent = `#${employeeData.id}`;

    const hireDate = employeeData.hire_date
        ? new Date(employeeData.hire_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '-';
    document.getElementById('employeeHireDate').textContent = hireDate;

    const salary = employeeData.salary
        ? '$' + parseFloat(employeeData.salary).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : 'N/A';
    document.getElementById('employeeSalary').textContent = salary;

    const createdAt = employeeData.created_at
        ? new Date(employeeData.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : '-';
    document.getElementById('employeeCreatedAt').textContent = createdAt;

    const statusClass = employeeData.status === 'active'
        ? 'status-active'
        : employeeData.status === 'on_leave'
            ? 'status-on-leave'
            : 'status-inactive';
    const statusText = employeeData.status === 'active'
        ? 'Active'
        : employeeData.status === 'on_leave'
            ? 'On Leave'
            : 'Inactive';

    const statusEl = document.getElementById('employeeStatus');
    statusEl.textContent = statusText;
    statusEl.className = `status-badge ${statusClass}`;

    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('employeeDetails').classList.remove('hidden');

    // Hide edit button if user doesn't have permission
    if (typeof RoleUtils !== 'undefined') {
        if (!RoleUtils.hasPermission('canEditEmployee')) {
            const editBtn = document.querySelector('button[onclick="editEmployee()"]') ||
                document.querySelector('.fa-edit').closest('button');
            if (editBtn) editBtn.style.display = 'none';
        }
    }
}

// Load attendance records
async function loadAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    const emptyState = document.getElementById('attendanceEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading attendance records...</p>
                    </div>
                </td>
            </tr>
        `;
    }

    try {
        const result = await apiCall(`attendance.php?employee_id=${employeeId}`, 'GET');

        if (result.attendance) {
            attendanceRecords = Array.isArray(result.attendance) ? result.attendance : [result.attendance];
            renderAttendance();
            updateAttendanceStats();
        } else {
            attendanceRecords = [];
            renderAttendance();
            updateAttendanceStats();
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading attendance records.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render attendance table
function renderAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    const emptyState = document.getElementById('attendanceEmptyState');

    if (!tbody) return;

    if (attendanceRecords.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    tbody.innerHTML = attendanceRecords.map(record => {
        const date = record.attendance_date
            ? new Date(record.attendance_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : '-';

        const checkIn = record.check_in_time || '-';
        const checkOut = record.check_out_time || '-';
        const notes = record.notes || '-';

        const statusClass = record.status === 'present'
            ? 'status-active'
            : 'status-inactive';
        const statusText = record.status === 'present' ? 'Present' : 'Absent';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${date}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${checkIn}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${checkOut}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700">
                    ${escapeHtml(notes)}
                </td>
            </tr>
        `;
    }).join('');
}

// Update attendance statistics
function updateAttendanceStats() {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    document.getElementById('totalDays').textContent = total;
    document.getElementById('presentDays').textContent = present;
    document.getElementById('absentDays').textContent = absent;
    document.getElementById('attendancePercentage').textContent = percentage + '%';
}

// Navigate to edit page
function editEmployee() {
    if (employeeId) {
        window.location.href = `edit-employee.html?id=${employeeId}`;
    }
}

// Show error state
function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('employeeDetails').classList.add('hidden');
    document.getElementById('errorState').classList.remove('hidden');
    document.getElementById('errorMessage').textContent = message;
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
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

