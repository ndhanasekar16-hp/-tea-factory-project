// Role-based access control utilities
// This module handles role permissions and access control for the frontend

const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    EMPLOYEE: 'employee'
};

// Define which pages each role can access
const ROLE_PERMISSIONS = {
    admin: {
        pages: ['dashboard', 'leaf-collections', 'production', 'inventory', 'employees',
            'attendance', 'payroll', 'quality', 'suppliers', 'transport',
            'purchase-orders', 'reports', 'settings', 'new-employee', 'edit-employee',
            'view-employee', 'mark-attendance', 'employee-dashboard'],
        canAddEmployee: true,
        canEditEmployee: true,
        canDeleteEmployee: true,
        canMarkAttendance: true,
        canAddLeafCollection: true,
        canViewAllEmployees: true,
        canViewAllAttendance: true,
        defaultPage: 'index.html'
    },
    manager: {
        pages: ['dashboard', 'leaf-collections', 'production', 'inventory', 'employees',
            'attendance', 'new-employee', 'edit-employee', 'view-employee', 'mark-attendance', 'purchase-orders'],
        canAddEmployee: true,
        canEditEmployee: true,
        canDeleteEmployee: false,
        canMarkAttendance: true,
        canAddLeafCollection: true,
        canViewAllEmployees: true,
        canViewAllAttendance: true,
        defaultPage: 'index.html'
    },
    employee: {
        pages: ['employees', 'attendance', 'leaf-collections', 'view-employee', 'employee-dashboard', 'payroll', 'settings'],
        canAddEmployee: false,
        canEditEmployee: false,
        canDeleteEmployee: false,
        canMarkAttendance: false,
        canAddLeafCollection: false,
        canViewAllEmployees: false,
        canViewAllAttendance: false,
        defaultPage: 'employee-dashboard.html'
    }
};

// Navigation items configuration with role visibility
const NAV_ITEMS = [
    { id: 'nav-dashboard', href: 'index.html', icon: '📊', label: 'Dashboard', page: 'dashboard', roles: ['admin', 'manager'] },
    { id: 'nav-leaf-collections', href: 'leaf-collections.html', icon: '🍃', label: 'Leaf Collection', page: 'leaf-collections', roles: ['admin', 'manager', 'employee'] },
    { id: 'nav-production', href: 'production.html', icon: '🏭', label: 'Production', page: 'production', roles: ['admin', 'manager'] },
    { id: 'nav-inventory', href: 'inventory.html', icon: '📦', label: 'Inventory', page: 'inventory', roles: ['admin', 'manager'] },
    { id: 'nav-employees', href: 'employees.html', icon: '👥', label: 'Employees', page: 'employees', roles: ['admin', 'manager', 'employee'] },
    { id: 'nav-attendance', href: 'attendance.html', icon: '🕒', label: 'Attendance', page: 'attendance', roles: ['admin', 'manager', 'employee'] },
    { id: 'nav-payroll', href: 'payroll.html', icon: '💰', label: 'Payroll', page: 'payroll', roles: ['admin', 'manager', 'employee'] },
    { id: 'nav-quality', href: 'quality.html', icon: '🧪', label: 'Quality Check', page: 'quality', roles: ['admin'] },
    { id: 'nav-suppliers', href: 'suppliers.html', icon: '🚜', label: 'Suppliers', page: 'suppliers', roles: ['admin'] },
    { id: 'nav-transport', href: 'transport.html', icon: '🚚', label: 'Transport', page: 'transport', roles: ['admin'] },
    { id: 'nav-purchase-orders', href: 'purchase_orders.html', icon: '📝', label: 'Purchase Orders', page: 'purchase-orders', roles: ['admin', 'manager'] },
    { id: 'nav-reports', href: 'reports.html', icon: '📑', label: 'Reports', page: 'reports', roles: ['admin'] },
    { id: 'nav-settings', href: 'settings.html', icon: '⚙️', label: 'Settings', page: 'settings', roles: ['admin', 'employee'] }
];

// Get current user from localStorage
function getCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            return JSON.parse(savedUser);
        } catch (e) {
            console.error('Error parsing current user:', e);
            return null;
        }
    }
    return null;
}

// Get current user's role (normalize legacy roles)
// Treat "user" role as "employee" for permissions/navigation
function getUserRole() {
    const user = getCurrentUser();
    if (!user || !user.role) return null;

    const normalized = user.role.toLowerCase().trim();
    if (normalized === 'user') {
        return 'employee';
    }

    return normalized;
}

// Get permissions for a specific role
function getRolePermissions(role) {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.employee;
}

// Check if current user can access a specific page
function canAccessPage(pageName) {
    const role = getUserRole();
    if (!role) return false;

    const permissions = getRolePermissions(role);
    return permissions.pages.includes(pageName);
}

// Check if current user has a specific permission
function hasPermission(permissionName) {
    const role = getUserRole();
    if (!role) return false;

    const permissions = getRolePermissions(role);
    return permissions[permissionName] === true;
}

// Get the current page name from URL
function getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';

    // Map filename to page name
    const pageMap = {
        'index.html': 'dashboard',
        'leaf-collections.html': 'leaf-collections',
        'production.html': 'production',
        'inventory.html': 'inventory',
        'employees.html': 'employees',
        'attendance.html': 'attendance',
        'quality.html': 'quality',
        'suppliers.html': 'suppliers',
        'transport.html': 'transport',
        'new-employee.html': 'new-employee',
        'edit-employee.html': 'edit-employee',
        'view-employee.html': 'view-employee',
        'mark-attendance.html': 'mark-attendance',
        'purchase_orders.html': 'purchase-orders',
        'employee-dashboard.html': 'employee-dashboard'
    };

    return pageMap[filename] || filename.replace('.html', '');
}

// Redirect to appropriate page if user doesn't have access
function enforcePageAccess() {
    const user = getCurrentUser();
    if (!user) {
        // Not logged in, redirect to login
        if (!window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        }
        return false;
    }

    const currentPage = getCurrentPageName();
    const permissions = getRolePermissions(user.role);

    // Check if user can access this page
    if (!permissions.pages.includes(currentPage)) {
        // Redirect to default page for their role
        window.location.href = permissions.defaultPage;
        return false;
    }

    return true;
}

// Filter navigation items based on role
function getVisibleNavItems() {
    const role = getUserRole();
    if (!role) return [];

    return NAV_ITEMS.filter(item => item.roles.includes(role));
}

// Generate navigation HTML for sidebar
function generateNavigation() {
    const visibleItems = getVisibleNavItems();

    return visibleItems.map(item => `
        <a href="${item.href}" id="${item.id}" class="nav-item flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition">
            <span>${item.icon}</span>
            <span>${item.label}</span>
        </a>
    `).join('');
}

// Hide navigation items that user shouldn't see
function filterNavigationByRole() {
    const role = getUserRole();
    if (!role) return;

    NAV_ITEMS.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            if (item.roles.includes(role)) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        }
    });
}

// Initialize role-based UI on page load
function initRoleBasedUI() {
    const currentPage = getCurrentPageName();

    // Skip enforcement for login page
    if (currentPage === 'dashboard' || currentPage === 'index') {
        const user = getCurrentUser();
        if (!user) return; // Still on login page
    }

    // Enforce page access
    if (!enforcePageAccess()) {
        return;
    }

    // Filter navigation if present
    filterNavigationByRole();

    // Apply role-specific UI modifications
    applyRoleSpecificUI();
}

// Apply role-specific UI modifications
function applyRoleSpecificUI() {
    const role = getUserRole();
    const permissions = getRolePermissions(role);

    // Hide add employee buttons for users without permission
    if (!permissions.canAddEmployee) {
        document.querySelectorAll('[data-permission="add-employee"]').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('a[href="new-employee.html"]').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Hide mark attendance buttons for users without permission
    if (!permissions.canMarkAttendance) {
        document.querySelectorAll('[data-permission="mark-attendance"]').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('a[href="mark-attendance.html"]').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Hide add leaf collection form for users without permission
    if (!permissions.canAddLeafCollection) {
        document.querySelectorAll('[data-permission="add-leaf-collection"]').forEach(el => {
            el.style.display = 'none';
        });
        // Also hide the form section
        const formSection = document.getElementById('leafCollectionFormSection');
        if (formSection) {
            formSection.style.display = 'none';
        }
    }
}

// Check if user should see all data or just their own
function shouldFilterToCurrentUser() {
    const role = getUserRole();
    const permissions = getRolePermissions(role);
    return !permissions.canViewAllEmployees;
}

// Get current user's email for filtering
function getCurrentUserEmail() {
    const user = getCurrentUser();
    return user ? user.email : null;
}

// Export functions for use in other modules
window.RoleUtils = {
    ROLES,
    ROLE_PERMISSIONS,
    NAV_ITEMS,
    getCurrentUser,
    getUserRole,
    getRolePermissions,
    canAccessPage,
    hasPermission,
    getCurrentPageName,
    enforcePageAccess,
    getVisibleNavItems,
    generateNavigation,
    filterNavigationByRole,
    initRoleBasedUI,
    applyRoleSpecificUI,
    shouldFilterToCurrentUser,
    getCurrentUserEmail
};
