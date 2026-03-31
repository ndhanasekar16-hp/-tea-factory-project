// User Dashboard JavaScript
// This page is specifically for users with 'user' role

const API_BASE_URL = 'http://localhost/Bacend/api/';

let currentUser = null;
let employeeData = null;

// Get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Check if user is authenticated
function checkAuth() {
    const token = getAuthToken();
    const savedUser = localStorage.getItem('currentUser');

    if (!token || !savedUser) {
        window.location.href = 'index.html';
        return false;
    }

    currentUser = JSON.parse(savedUser);

    // If not a user/employee role, redirect to main dashboard
    if (currentUser.role !== 'user' && currentUser.role !== 'employee') {
        window.location.href = 'index.html';
        return false;
    }

    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    updateUserInfo();
    loadEmployeeProfile();
    loadAttendanceStats();
    loadRecentAttendance();
});

// Update user info in sidebar and header
function updateUserInfo() {
    if (!currentUser) return;

    document.getElementById('userEmail').textContent = currentUser.email;
    document.getElementById('userName').textContent = currentUser.full_name;
    document.getElementById('userRoleDisplay').textContent = 'Employee';

    const names = currentUser.full_name.split(' ');
    const initials = names.length >= 2
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];

    document.getElementById('userInitials').textContent = initials.toUpperCase();
    document.getElementById('profileInitials').textContent = initials.toUpperCase();
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

// Load employee profile
async function loadEmployeeProfile() {
    try {
        const result = await apiCall('employees.php', 'GET');

        if (result.employees) {
            // Find the employee matching current user's email
            employeeData = result.employees.find(emp =>
                emp.email.toLowerCase() === currentUser.email.toLowerCase()
            );

            if (employeeData) {
                updateProfileDisplay();
            } else {
                // User not found as employee, show limited info from user data
                showLimitedProfile();
            }
        }
    } catch (error) {
        console.error('Error loading employee profile:', error);
        showLimitedProfile();
    }
}

// Update profile display with employee data
function updateProfileDisplay() {
    if (!employeeData) return;

    document.getElementById('profileName').textContent = employeeData.full_name;
    document.getElementById('profilePosition').textContent = employeeData.position || 'Employee';
    document.getElementById('profileDepartment').textContent = employeeData.department || 'General';
    document.getElementById('profileEmail').textContent = employeeData.email;
    document.getElementById('profilePhone').textContent = employeeData.phone || 'Not provided';
    document.getElementById('profileDeptDetail').textContent = employeeData.department || 'General';

    // Update status badge
    const statusEl = document.getElementById('profileStatus');
    if (employeeData.status === 'active') {
        statusEl.className = 'px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold';
        statusEl.textContent = 'Active';
    } else if (employeeData.status === 'on_leave') {
        statusEl.className = 'px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold';
        statusEl.textContent = 'On Leave';
    } else {
        statusEl.className = 'px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold';
        statusEl.textContent = 'Inactive';
    }

    // Update employee ID
    if (document.getElementById('profileEmployeeId')) {
        document.getElementById('profileEmployeeId').textContent = 'EMP-' + employeeData.id.toString().padStart(4, '0');
    }

    // Format and display hire date in profile section
    if (employeeData.hire_date) {
        const hireDate = new Date(employeeData.hire_date);
        const formattedDate = hireDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        if (document.getElementById('profileJoinDate')) {
            document.getElementById('profileJoinDate').textContent = formattedDate;
        }
    }
}

// Show limited profile from user data
function showLimitedProfile() {
    document.getElementById('profileName').textContent = currentUser.full_name;
    document.getElementById('profilePosition').textContent = 'Employee';
    document.getElementById('profileDepartment').textContent = 'General';
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone || 'Not provided';
    document.getElementById('profileDeptDetail').textContent = 'General';
}

// Load attendance statistics
async function loadAttendanceStats() {
    try {
        const result = await apiCall('attendance.php', 'GET');

        if (result.attendance) {
            // Filter attendance for current user
            const userAttendance = filterUserAttendance(result.attendance);

            // Calculate this month's stats
            const now = new Date();
            const thisMonth = userAttendance.filter(record => {
                const recordDate = new Date(record.attendance_date);
                return recordDate.getMonth() === now.getMonth() &&
                    recordDate.getFullYear() === now.getFullYear();
            });

            const presentDays = thisMonth.filter(r => r.status === 'present').length;
            const absentDays = thisMonth.filter(r => r.status === 'absent').length;

            document.getElementById('presentDays').textContent = presentDays;
            document.getElementById('absentDays').textContent = absentDays;
        }
    } catch (error) {
        console.error('Error loading attendance stats:', error);
        document.getElementById('presentDays').textContent = '--';
        document.getElementById('absentDays').textContent = '--';
    }

    // Load leaf collection stats
    try {
        const result = await apiCall('leaf_collections.php', 'GET');
        if (result.leaf_collections) {
            const now = new Date();
            let totalLeaf = 0;

            const thisMonth = result.leaf_collections.filter(record => {
                const recordDate = new Date(record.collection_date);
                return recordDate.getMonth() === now.getMonth() &&
                    recordDate.getFullYear() === now.getFullYear() &&
                    (
                        (employeeData && record.employee_id == employeeData.id) ||
                        (record.bought_from &&
                            record.bought_from.toLowerCase() === currentUser.full_name.toLowerCase())
                    );
            });

            thisMonth.forEach(r => {
                totalLeaf += parseFloat(r.leaf_quantity_kg || 0);
            });

            document.getElementById('totalLeafCollection').textContent =
                totalLeaf.toFixed(2) + ' kg';
        }
    } catch (error) {
        console.error('Error loading leaf collections:', error);
        document.getElementById('totalLeafCollection').textContent = '--';
    }

    // Load payroll stats
    try {
        const result = await apiCall('payroll.php', 'GET');
        if (result.payroll) {
            let userPayroll = [];
            if (employeeData) {
                userPayroll = result.payroll.filter(p => 
                    (p.employee_id && p.employee_id.replace('EMP-', '') == employeeData.id) || 
                    (p.payee_name && p.payee_name.toLowerCase() === employeeData.full_name.toLowerCase())
                );
            }
            if (userPayroll.length > 0) {
                // Get most recent salary
                const recent = userPayroll.sort((a,b) => new Date(b.payment_date) - new Date(a.payment_date))[0];
                document.getElementById('payrollSummary').textContent = '₹' + parseFloat(recent.amount).toLocaleString();
            } else {
                document.getElementById('payrollSummary').textContent = 'No records';
            }
        }
    } catch (error) {
        console.error('Error loading payroll stats:', error);
        document.getElementById('payrollSummary').textContent = '--';
    }
}

// Filter attendance records for current user
function filterUserAttendance(allAttendance) {
    if (!employeeData) {
        // Try to filter by email matching
        return allAttendance.filter(record => {
            return record.employee_email &&
                record.employee_email.toLowerCase() === currentUser.email.toLowerCase();
        });
    }

    // Filter by employee ID
    return allAttendance.filter(record => record.employee_id === employeeData.id);
}

// Load recent attendance
async function loadRecentAttendance() {
    try {
        const result = await apiCall('attendance.php', 'GET');

        if (result.attendance) {
            const userAttendance = filterUserAttendance(result.attendance);

            // Sort by date descending and take last 5
            userAttendance.sort((a, b) => new Date(b.attendance_date) - new Date(a.attendance_date));
            const recent = userAttendance.slice(0, 5);

            const container = document.getElementById('recentAttendance');

            if (recent.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <i class="fas fa-calendar-times text-4xl text-gray-300 mb-3"></i>
                        <p>No attendance records found</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = recent.map(record => {
                const date = new Date(record.attendance_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                });

                const statusClass = record.status === 'present'
                    ? 'bg-green-500'
                    : 'bg-red-500';

                const statusText = record.status === 'present' ? 'Present' : 'Absent';

                const checkIn = record.check_in_time
                    ? formatTime(record.check_in_time)
                    : '--:--';
                const checkOut = record.check_out_time
                    ? formatTime(record.check_out_time)
                    : '--:--';

                return `
                    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                        <div class="flex items-center space-x-3">
                            <div class="w-2 h-2 ${statusClass} rounded-full"></div>
                            <div>
                                <p class="font-semibold text-gray-800">${date}</p>
                                <p class="text-sm text-gray-500">${checkIn} - ${checkOut}</p>
                            </div>
                        </div>
                        <span class="px-3 py-1 text-xs font-semibold rounded-full ${record.status === 'present'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }">
                            ${statusText}
                        </span>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading recent attendance:', error);
        document.getElementById('recentAttendance').innerHTML = `
            <div class="text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-4xl text-red-300 mb-3"></i>
                <p>Error loading attendance</p>
            </div>
        `;
    }
}

// Format time from HH:MM:SS to HH:MM AM/PM
function formatTime(timeString) {
    if (!timeString) return '--:--';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        window.location.href = 'index.html';
    }
}
