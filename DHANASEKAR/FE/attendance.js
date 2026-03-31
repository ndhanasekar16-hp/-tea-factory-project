// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

let allAttendance = [];
let allEmployees = [];
let filteredAttendance = [];
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
    loadAttendance();

    // Apply role-based UI
    if (typeof RoleUtils !== 'undefined') {
        RoleUtils.applyRoleSpecificUI();
    }
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('editAttendanceForm').addEventListener('submit', handleEditSubmit);
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

// Load employees (for name lookup)
async function loadEmployees() {
    try {
        const result = await apiCall('employees.php', 'GET');
        if (result.employees) {
            allEmployees = result.employees;
        }
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

// Get current user's employee ID
function getCurrentUserEmployeeId() {
    if (!currentUserData || !allEmployees.length) return null;

    const matchedEmployee = allEmployees.find(emp =>
        emp.email.toLowerCase() === currentUserData.email.toLowerCase()
    );

    return matchedEmployee ? matchedEmployee.id : null;
}

// Load attendance records
async function loadAttendance() {
    try {
        const result = await apiCall('attendance.php', 'GET');

        if (result.attendance) {
            allAttendance = result.attendance;

            // Filter for user role - only show their own attendance
            let currentRole = null;
            if (typeof RoleUtils !== 'undefined') {
                currentRole = RoleUtils.getUserRole();
            } else if (currentUserData && currentUserData.role) {
                currentRole = currentUserData.role.toLowerCase().trim();
            }

            if ((currentRole === 'employee' || currentRole === 'user') && currentUserData) {
                const userEmployeeId = getCurrentUserEmployeeId();
                if (userEmployeeId) {
                    allAttendance = allAttendance.filter(att => att.employee_id === userEmployeeId);
                } else {
                    // Try to match by email if employee ID not found
                    const userEmail = currentUserData.email.toLowerCase();
                    allAttendance = allAttendance.filter(att => {
                        const employee = allEmployees.find(emp => emp.id === att.employee_id);
                        return employee && employee.email.toLowerCase() === userEmail;
                    });
                }
            }

            filteredAttendance = [...allAttendance];
            updateStats();
            renderAttendance();
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
        document.getElementById('attendanceTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-red-500">
                    <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                    <p>Error loading attendance records. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

// Update statistics
function updateStats() {
    const total = filteredAttendance.length;
    const present = filteredAttendance.filter(att => att.status === 'present').length;
    const absent = filteredAttendance.filter(att => att.status === 'absent').length;
    const uniqueEmployees = new Set(filteredAttendance.map(att => att.employee_id)).size;

    document.getElementById('totalRecords').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('uniqueEmployees').textContent = uniqueEmployees;
}

// Check if current user can edit attendance
function canEditAttendance() {
    if (!currentUserData) return false;

    // Use RoleUtils if available
    if (typeof RoleUtils !== 'undefined') {
        return RoleUtils.hasPermission('canMarkAttendance');
    }

    // Fallback: admin and manager can edit, user cannot
    return currentUserData.role === 'admin' || currentUserData.role === 'manager';
}

// Render attendance table
function renderAttendance() {
    const tbody = document.getElementById('attendanceTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredAttendance.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Sort by date (newest first)
    const sorted = [...filteredAttendance].sort((a, b) => {
        return new Date(b.attendance_date) - new Date(a.attendance_date);
    });

    tbody.innerHTML = sorted.map(record => {
        const employee = allEmployees.find(emp => emp.id === record.employee_id);
        const employeeName = employee ? employee.full_name : `Employee #${record.employee_id}`;

        const date = new Date(record.attendance_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            weekday: 'short'
        });

        const checkIn = record.check_in_time || 'N/A';
        const checkOut = record.check_out_time || 'N/A';

        const statusClass = record.status === 'present' ? 'status-present' : 'status-absent';
        const statusText = record.status === 'present' ? 'Present' : 'Absent';

        return `
            <tr class="attendance-row">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${date}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            ${employeeName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${escapeHtml(employeeName)}</div>
                            ${employee ? `<div class="text-xs text-gray-500">${escapeHtml(employee.position)}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="time-badge">${checkIn}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="time-badge">${checkOut}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-xs truncate" title="${escapeHtml(record.notes || '')}">
                        ${escapeHtml(record.notes || 'No notes')}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${canEditAttendance() ? `
                    <button onclick="editAttendance(${record.id})" 
                            class="action-btn bg-blue-100 text-blue-700 hover:bg-blue-200 mr-2">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    ` : ''}
                    <a href="view-employee.html?id=${record.employee_id}" 
                       class="action-btn bg-purple-100 text-purple-700 hover:bg-purple-200">
                        <i class="fas fa-eye mr-1"></i>View
                    </a>
                </td>
            </tr>
        `;
    }).join('');
}

// Apply filters
function applyFilters() {
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    filteredAttendance = allAttendance.filter(record => {
        const matchesDate = !dateFilter || record.attendance_date === dateFilter;
        const matchesStatus = !statusFilter || record.status === statusFilter;

        return matchesDate && matchesStatus;
    });

    updateStats();
    renderAttendance();
}

// Clear filters
function clearFilters() {
    document.getElementById('dateFilter').value = '';
    document.getElementById('statusFilter').value = '';
    filteredAttendance = [...allAttendance];
    updateStats();
    renderAttendance();
}

// Edit attendance (placeholder)
// Edit attendance
function editAttendance(id) {
    const record = allAttendance.find(r => r.id === id);
    if (!record) return;

    document.getElementById('editRecordId').value = id;
    document.getElementById('editStatus').value = record.status;
    document.getElementById('editCheckIn').value = record.check_in_time ? record.check_in_time.substring(0, 5) : '';
    document.getElementById('editCheckOut').value = record.check_out_time ? record.check_out_time.substring(0, 5) : '';
    document.getElementById('editNotes').value = record.notes || '';

    document.getElementById('editAttendanceModal').classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editAttendanceModal').classList.add('hidden');
}

// Handle edit form submission
async function handleEditSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('editRecordId').value;
    const status = document.getElementById('editStatus').value;
    const checkIn = document.getElementById('editCheckIn').value;
    const checkOut = document.getElementById('editCheckOut').value;
    const notes = document.getElementById('editNotes').value;

    try {
        await apiCall('attendance.php', 'PATCH', {
            id: id,
            status: status,
            check_in_time: checkIn,
            check_out_time: checkOut,
            notes: notes
        });

        closeEditModal();
        loadAttendance(); // Reload to see changes

        // Show success message (optional, but good UX)
        alert('Attendance updated successfully');
    } catch (error) {
        console.error('Error updating attendance:', error);
        alert('Failed to update attendance: ' + error.message);
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
