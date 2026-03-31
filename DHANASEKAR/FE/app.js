// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// Session Management
let currentUser = null;
let authToken = null;
let sessionTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    checkExistingSession();
    setupFormListeners();
    setupDashboardListeners();
});

// Check for existing session
function checkExistingSession() {
    authToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (authToken && savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            const role = (currentUser.role || '').toLowerCase().trim();
            console.log('Session check - User:', currentUser, 'Role:', role);

            // Redirect user role to employee-dashboard if they land on index.html
            // BUT ONLY if we are actually allowed to redirect (not if we are already handling things)
            if (role === 'employee' || role === 'user') {
                console.log('Redirecting existing session user to employee-dashboard.html');
                window.location.href = 'employee-dashboard.html';
                return;
            }
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            return;
        }

        showDashboard();
        loadDashboardData();
    }
}

// Setup form listeners
function setupFormListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);

    // Forgot password form
    // Forgot password form
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
}

// Setup dashboard listeners
function setupDashboardListeners() {
    const reportBtn = document.getElementById('quickAction-generateReport');
    if (reportBtn) {
        reportBtn.addEventListener('click', generateReport);
    }
}

// API Helper Functions
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (requiresAuth && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
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

        console.log('API Response:', { endpoint, status: response.status, data }); // Debug log

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    showLoading('login');
    hideMessage('loginError');
    hideMessage('loginSuccess');

    if (!validateLoginForm(email, password)) {
        hideLoading('login');
        return;
    }

    try {
        const result = await apiCall('login.php', 'POST', { email, password });

        console.log('Login response:', result); // Debug log

        // Check if we have user data
        if (result && result.user) {
            currentUser = result.user;
            authToken = result.token || btoa(result.user.id + ':' + result.user.email + ':' + Date.now());

            console.log('Setting user:', currentUser);
            console.log('Setting token:', authToken);

            // Save session
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            setSessionTimeout();
            showMessage('loginSuccess', 'Login successful! Redirecting...');

            // Redirect based on role
            setTimeout(() => {
                const role = (currentUser.role || '').toLowerCase().trim();
                console.log('Redirecting based on normalized role:', role);

                // Redirect employee role to employee-dashboard
                if (role === 'employee' || role === 'user') {
                    console.log('Role is employee, redirecting to employee-dashboard.html');
                    window.location.href = 'employee-dashboard.html';
                } else {
                    console.log('Role is ' + role + ', showing dashboard');
                    showDashboard();
                    loadDashboardData();
                }
            }, 1000);
        } else {
            console.error('Invalid response structure:', result);
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        showMessage('loginError', error.message || 'Invalid email or password. Please try again.');
        document.getElementById('loginForm').classList.add('shake');
        setTimeout(() => {
            document.getElementById('loginForm').classList.remove('shake');
        }, 500);
    } finally {
        hideLoading('login');
    }
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();

    const formData = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('registerEmail').value,
        phone: document.getElementById('phoneNumber').value,
        password: document.getElementById('registerPassword').value,
        role: document.getElementById('userRole').value || 'employee'
    };

    showLoading('register');
    hideMessage('registerError');
    hideMessage('registerSuccess');

    if (!validateRegisterForm(formData)) {
        hideLoading('register');
        return;
    }

    try {
        // Note: Registration requires admin role, so we'll show a message
        // In a real scenario, you might want a public registration endpoint
        showMessage('registerSuccess', 'Registration request submitted. Please contact an administrator or login if you already have an account.');
        document.getElementById('registerForm').reset();
        document.getElementById('passwordStrengthBar').style.width = '0%';
        document.getElementById('passwordStrengthText').textContent = '';

        setTimeout(() => {
            showLogin();
        }, 2000);
    } catch (error) {
        showMessage('registerError', error.message || 'Registration failed. Please try again.');
    } finally {
        hideLoading('register');
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value;

    hideMessage('forgotPasswordError');
    hideMessage('forgotPasswordSuccess');

    // Note: This endpoint doesn't exist yet, so we'll just show a message
    showMessage('forgotPasswordSuccess', 'Password reset feature coming soon.');

    setTimeout(() => {
        closeForgotPassword();
    }, 2000);
}

// Validate login form
function validateLoginForm(email, password) {
    let isValid = true;

    if (!email || email.trim() === '') {
        document.getElementById('loginEmailError').textContent = 'Please enter your email or Employee ID';
        document.getElementById('loginEmailError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('loginEmailError').classList.add('hidden');
    }

    if (password.length < 1) {
        document.getElementById('loginPasswordError').textContent = 'Password is required';
        document.getElementById('loginPasswordError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('loginPasswordError').classList.add('hidden');
    }

    return isValid;
}

// Validate register form
function validateRegisterForm(data) {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        document.getElementById('registerEmailError').textContent = 'Please enter a valid email address';
        document.getElementById('registerEmailError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('registerEmailError').classList.add('hidden');
    }

    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
        document.getElementById('confirmPasswordError').classList.remove('hidden');
        isValid = false;
    } else {
        document.getElementById('confirmPasswordError').classList.add('hidden');
    }

    if (password.length < 1) {
        showMessage('registerError', 'Password is required');
        isValid = false;
    }

    if (!document.getElementById('agreeTerms').checked) {
        showMessage('registerError', 'You must agree to the terms and conditions');
        isValid = false;
    }

    return isValid;
}

// Check password strength
function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthBar = document.getElementById('passwordStrengthBar');
    const strengthText = document.getElementById('passwordStrengthText');

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;

    const strengthLevels = [
        { width: '0%', color: 'bg-red-500', text: '' },
        { width: '25%', color: 'bg-red-500', text: 'Weak' },
        { width: '50%', color: 'bg-yellow-500', text: 'Fair' },
        { width: '75%', color: 'bg-blue-500', text: 'Good' },
        { width: '100%', color: 'bg-green-500', text: 'Strong' }
    ];

    const level = strengthLevels[strength];
    strengthBar.style.width = level.width;
    strengthBar.className = `h-full password-strength-bar ${level.color}`;
    strengthText.textContent = level.text;
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling.querySelector('i');

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show/hide sections
function showLogin() {
    hideAllSections();
    document.getElementById('loginSection').classList.remove('hidden');
}

function showRegister() {
    hideAllSections();
    document.getElementById('registerSection').classList.remove('hidden');
}

function showDashboard() {
    hideAllSections();
    document.getElementById('dashboardSection').classList.remove('hidden');

    if (currentUser) {
        document.getElementById('userEmail').textContent = currentUser.email;
        document.getElementById('userName').textContent = currentUser.full_name;
        document.getElementById('userRoleDisplay').textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

        const names = currentUser.full_name.split(' ');
        const initials = names.length >= 2
            ? names[0][0] + names[names.length - 1][0]
            : names[0][0];
        document.getElementById('userInitials').textContent = initials.toUpperCase();

        // Apply role-based UI filtering
        if (typeof RoleUtils !== 'undefined') {
            console.log('Applying role-based UI filtering for role:', currentUser.role);
            RoleUtils.filterNavigationByRole();
            RoleUtils.applyRoleSpecificUI();
        } else {
            console.error('RoleUtils is undefined!');
        }
    }
}

function hideAllSections() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('registerSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.add('hidden');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load employees count
        const employeesData = await apiCall('employees.php', 'GET', null, true);
        if (employeesData.employees) {
            document.getElementById('totalEmployees').textContent = employeesData.employees.length;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Forgot password modal
function showForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.remove('hidden');
}

function closeForgotPassword() {
    document.getElementById('forgotPasswordModal').classList.add('hidden');
    document.getElementById('forgotPasswordForm').reset();
    hideMessage('forgotPasswordError');
    hideMessage('forgotPasswordSuccess');
}

// Logout
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await apiCall('logout.php', 'POST', null, true);
        } catch (error) {
            console.error('Logout error:', error);
        }

        currentUser = null;
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');

        if (sessionTimeout) {
            clearTimeout(sessionTimeout);
        }

        showLogin();
    }
}

// Session timeout
function setSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }

    sessionTimeout = setTimeout(() => {
        alert('Session expired. Please login again.');
        logout();
    }, 30 * 60 * 1000); // 30 minutes
}

// UI helpers
function showLoading(form) {
    if (form === 'login') {
        document.getElementById('loginBtnText').classList.add('hidden');
        document.getElementById('loginLoader').classList.remove('hidden');
        document.getElementById('loginBtn').disabled = true;
    } else if (form === 'register') {
        document.getElementById('registerBtnText').classList.add('hidden');
        document.getElementById('registerLoader').classList.remove('hidden');
        document.getElementById('registerBtn').disabled = true;
    }
}

function hideLoading(form) {
    if (form === 'login') {
        document.getElementById('loginBtnText').classList.remove('hidden');
        document.getElementById('loginLoader').classList.add('hidden');
        document.getElementById('loginBtn').disabled = false;
    } else if (form === 'register') {
        document.getElementById('registerBtnText').classList.remove('hidden');
        document.getElementById('registerLoader').classList.add('hidden');
        document.getElementById('registerBtn').disabled = false;
    }
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.classList.remove('hidden');

    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

function hideMessage(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// Employee Management Functions
function showAddEmployeeModal() {
    window.location.href = 'new-employee.html';
}

function showAttendanceModal() {
    window.location.href = 'mark-attendance.html';
}

// Activity tracking
document.addEventListener('mousemove', () => {
    if (currentUser) {
        setSessionTimeout();
    }
});

document.addEventListener('keypress', () => {
    if (currentUser) {
        setSessionTimeout();
    }
});

// Generate Report
async function generateReport() {
    const btn = document.getElementById('quickAction-generateReport');
    const originalContent = btn.innerHTML;
    console.log('Generating report...');
    try {
        btn.disabled = true;
        btn.innerHTML = '<div class="loader mx-auto"></div><p class="text-sm mt-2">Generating...</p>';

        const workbook = new ExcelJS.Workbook();
        workbook.creator = currentUser ? currentUser.full_name : 'System';
        workbook.created = new Date();

        // Define report structure
        const reports = [
            {
                name: 'Attendance',
                api: 'attendance.php',
                key: 'attendance',
                columns: [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Employee ID', key: 'employee_id', width: 15 },
                    { header: 'Date', key: 'attendance_date', width: 15 },
                    { header: 'Check In', key: 'check_in_time', width: 15 },
                    { header: 'Check Out', key: 'check_out_time', width: 15 },
                    { header: 'Status', key: 'status', width: 15 },
                    { header: 'Notes', key: 'notes', width: 30 }
                ]
            },
            {
                name: 'Employees',
                api: 'employees.php',
                key: 'employees',
                columns: [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Name', key: 'full_name', width: 25 },
                    { header: 'Email', key: 'email', width: 25 },
                    { header: 'Position', key: 'position', width: 20 },
                    { header: 'Department', key: 'department', width: 20 },
                    { header: 'Hire Date', key: 'hire_date', width: 15 },
                    { header: 'Salary', key: 'salary', width: 15 },
                    { header: 'Status', key: 'status', width: 15 }
                ]
            },
            {
                name: 'Inventory',
                api: 'inventory.php',
                key: 'inventory',
                columns: [
                    { header: 'ID', key: 'inventory_id', width: 10 },
                    { header: 'Product', key: 'product_name', width: 25 },
                    { header: 'Code', key: 'product_code', width: 15 },
                    { header: 'Type', key: 'tea_type', width: 15 },
                    { header: 'Grade', key: 'grade', width: 10 },
                    { header: 'Stock (kg)', key: 'current_stock_kg', width: 15 },
                    { header: 'Value', key: 'total_stock_value', width: 15 }
                ]
            },
            {
                name: 'Leaf Collections',
                api: 'leaf_collections.php',
                key: 'leaf_collections',
                columns: [
                    { header: 'Farmer ID', key: 'farmer_id', width: 15 },
                    { header: 'Date', key: 'collection_date', width: 15 },
                    { header: 'Bought From', key: 'bought_from', width: 25 },
                    { header: 'Quantity (kg)', key: 'leaf_quantity_kg', width: 15 },
                    { header: 'Grade', key: 'leaf_grade', width: 10 },
                    { header: 'Location', key: 'farmer_location', width: 20 }
                ]
            },
            {
                name: 'Payroll',
                api: 'payroll.php',
                key: 'payroll',
                columns: [
                    { header: 'ID', key: 'payroll_id', width: 10 },
                    { header: 'Date', key: 'payment_date', width: 15 },
                    { header: 'Payee', key: 'payee_name', width: 25 },
                    { header: 'Amount', key: 'amount', width: 15 },
                    { header: 'Type', key: 'payment_type', width: 15 },
                    { header: 'Category', key: 'payment_category', width: 15 },
                    { header: 'Status', key: 'payment_status', width: 15 }
                ]
            },
            {
                name: 'Production',
                api: 'production.php',
                key: 'productions',
                columns: [
                    { header: 'ID', key: 'production_id', width: 10 },
                    { header: 'Date', key: 'production_date', width: 15 },
                    { header: 'Leaf Type', key: 'leaf_type', width: 20 },
                    { header: 'Quantity (kg)', key: 'production_quantity_kg', width: 15 },
                    { header: 'Quality', key: 'production_quality', width: 10 },
                    { header: 'Cost', key: 'production_cost', width: 15 }
                ]
            },
            {
                name: 'Purchase Orders',
                api: 'purchase_orders.php',
                key: 'purchase_orders',
                columns: [
                    { header: 'ID', key: 'purchase_id', width: 10 },
                    { header: 'Date', key: 'purchase_date', width: 15 },
                    { header: 'Supplier', key: 'supplier_name', width: 25 },
                    { header: 'Material', key: 'material_name', width: 20 },
                    { header: 'Quantity', key: 'quantity', width: 15 },
                    { header: 'Total Cost', key: 'total_cost', width: 15 },
                    { header: 'Status', key: 'purchase_status', width: 15 }
                ]
            },
            {
                name: 'Quality',
                api: 'quality.php',
                key: 'quality',
                columns: [
                    { header: 'ID', key: 'quality_id', width: 10 },
                    { header: 'Batch No', key: 'batch_no', width: 15 },
                    { header: 'Date', key: 'production_date', width: 15 },
                    { header: 'Status', key: 'quality_status', width: 15 },
                    { header: 'Moisture %', key: 'moisture_in_percentage', width: 15 },
                    { header: 'Color', key: 'color_', width: 15 },
                    { header: 'Aroma', key: 'aroma', width: 15 },
                    { header: 'Taste', key: 'taste', width: 15 }
                ]
            },
            {
                name: 'Suppliers',
                api: 'suppliers.php',
                key: 'suppliers',
                columns: [
                    { header: 'ID', key: 'supply_id', width: 10 },
                    { header: 'Name', key: 'supplier_name', width: 25 },
                    { header: 'Type', key: 'supplier_type', width: 20 },
                    { header: 'Item', key: 'item_supplied', width: 20 },
                    { header: 'Quantity', key: 'quantity', width: 15 },
                    { header: 'Price/Kg', key: 'price_per_kg', width: 15 },
                    { header: 'Status', key: 'suppliers_status', width: 15 }
                ]
            },
            {
                name: 'Transport',
                api: 'transport.php',
                key: 'transport',
                columns: [
                    { header: 'ID', key: 'transport_id', width: 10 },
                    { header: 'Vehicle No', key: 'vehicle_number', width: 15 },
                    { header: 'Driver', key: 'driver_name', width: 20 },
                    { header: 'Date', key: 'transport_date', width: 15 },
                    { header: 'Source', key: 'source_location', width: 20 },
                    { header: 'Destination', key: 'destination_location', width: 20 },
                    { header: 'Material', key: 'material_type', width: 15 },
                    { header: 'Cost', key: 'fuel_cost', width: 15 }
                ]
            }
        ];

        // Fetch all data and create sheets
        for (const report of reports) {
            try {
                const sheet = workbook.addWorksheet(report.name);
                sheet.columns = report.columns;

                // Style header row
                sheet.getRow(1).font = { bold: true };
                sheet.getRow(1).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };

                // Fetch data
                const response = await apiCall(report.api, 'GET', null, true);
                const data = response[report.key] || [];

                // Add rows
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        sheet.addRow(item);
                    });
                }
            } catch (err) {
                console.error(`Error generating report for ${report.name}:`, err);
                const sheet = workbook.addWorksheet(report.name + ' (Error)');
                sheet.addRow(['Error fetching data', err.message]);
            }
        }
        console.log('Report generated successfully!');
        // Write to buffer and save
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `factory_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
        console.log('Report generated successfully2!');
        // Show success message using the generic showMessage function if available, or fallback
        if (typeof showMessage === 'function') {
            showMessage('loginSuccess', 'Report generated successfully!');
            document.getElementById('loginSuccess').classList.remove('hidden');
            setTimeout(() => document.getElementById('loginSuccess').classList.add('hidden'), 3000);
        } else {
            alert('Report generated successfully!');
        }
        console.log('Report generated successfully3!');
    } catch (error) {
        console.error('Report generation error:', error);
        alert('Failed to generate report: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

