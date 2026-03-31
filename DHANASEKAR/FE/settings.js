document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSettings();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('userName').textContent = user.full_name || 'User';
    document.getElementById('userEmail').textContent = user.email || '';

    // Initials
    const name = user.full_name || 'U';
    document.getElementById('userInitials').textContent = name.charAt(0).toUpperCase();

    // Default Section
    showSection('company');
}

// Global state
let currentSettings = {};

// UI Configuration for each section
// Types: text, number, email, textarea, select, checkbox, list
const SECTIONS = {
    company: {
        title: 'Company / Factory Settings',
        key: 'profile',
        fields: [
            { name: 'factory_name', label: 'Factory Name', type: 'text' },
            { name: 'owner_name', label: 'Owner / Manager Name', type: 'text' },
            { name: 'address', label: 'Address', type: 'textarea' },
            { name: 'contact', label: 'Contact Number', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'gst_number', label: 'GST Number', type: 'text' },
            { name: 'fssai_license', label: 'FSSAI License No', type: 'text' },
            { name: 'financial_year', label: 'Financial Year', type: 'text', placeholder: 'e.g. 2024-2025' },
            { name: 'currency', label: 'Currency', type: 'text', value: 'INR' }
        ]
    },
    users: {
        title: 'User & Role Settings',
        key: 'roles_permissions',
        description: 'Define permissions for each role.',
        fields: [
            {
                name: 'roles',
                label: 'Role Permissions',
                type: 'list',
                columns: [
                    { name: 'role', label: 'Role Name', type: 'text', readonly: true },
                    { name: 'can_view_purchase', label: 'View Purchase', type: 'checkbox' },
                    { name: 'can_edit_purchase', label: 'Edit Purchase', type: 'checkbox' },
                    { name: 'can_access_payroll', label: 'Payroll Access', type: 'checkbox' },
                    { name: 'can_access_reports', label: 'Reports Access', type: 'checkbox' },
                    { name: 'can_update_stock', label: 'Stock Update', type: 'checkbox' }
                ],
                defaultValue: [
                    { role: 'Admin', can_view_purchase: true, can_edit_purchase: true, can_access_payroll: true, can_access_reports: true, can_update_stock: true },
                    { role: 'Manager', can_view_purchase: true, can_edit_purchase: true, can_access_payroll: true, can_access_reports: true, can_update_stock: true },
                    { role: 'Supervisor', can_view_purchase: true, can_edit_purchase: false, can_access_payroll: false, can_access_reports: false, can_update_stock: true },
                    { role: 'Accountant', can_view_purchase: true, can_edit_purchase: false, can_access_payroll: true, can_access_reports: true, can_update_stock: false },
                    { role: 'Store Keeper', can_view_purchase: true, can_edit_purchase: false, can_access_payroll: false, can_access_reports: false, can_update_stock: true },
                    { role: 'Worker', can_view_purchase: false, can_edit_purchase: false, can_access_payroll: false, can_access_reports: false, can_update_stock: false }
                ]
            }
        ]
    },
    raw_material: {
        title: 'Raw Material Settings',
        key: 'materials_list',
        fields: [
            {
                name: 'materials',
                label: 'Materials List',
                type: 'list',
                addItemLabel: 'Add New Material',
                columns: [
                    { name: 'code', label: 'Material Code', type: 'text' },
                    { name: 'supplier', label: 'Supplier Name', type: 'text' },
                    { name: 'name', label: 'Material Name', type: 'text' },
                    { name: 'unit', label: 'Unit', type: 'select', options: ['Kg', 'Litre', 'Packet', 'Piece'] },
                    { name: 'price', label: 'Price/Unit (₹)', type: 'number' },
                    { name: 'reorder_level', label: 'Reorder Level', type: 'number' }
                ],
                defaultValue: [
                    { code: 'RM001', supplier: 'Green Leaf Ltd', name: 'Green Tea Leaves', unit: 'Kg', price: 150, reorder_level: 100 },
                    { code: 'RM002', supplier: 'Sugar Co', name: 'Sugar', unit: 'Kg', price: 40, reorder_level: 50 },
                    { code: 'RM003', supplier: 'Dairy Best', name: 'Milk Powder', unit: 'Kg', price: 300, reorder_level: 20 }
                ]
            }
        ]
    },
    production: {
        title: 'Production Settings',
        key: 'production_config',
        fields: [
            { name: 'batch_format', label: 'Batch Number Format', type: 'text', placeholder: 'BATCH-YYYY-###' },
            { name: 'daily_capacity', label: 'Production Capacity (per day)', type: 'number' },
            { name: 'wastage_percent', label: 'Wastage %', type: 'number' },
            {
                name: 'tea_types',
                label: 'Tea Types',
                type: 'list',
                addItemLabel: 'Add Tea Type',
                columns: [
                    { name: 'name', label: 'Type Name', type: 'text' },
                    { name: 'code', label: 'Code', type: 'text' }
                ],
                defaultValue: [
                    { name: 'Black Tea', code: 'BT' },
                    { name: 'Green Tea', code: 'GT' },
                    { name: 'Masala Tea', code: 'MT' }
                ]
            }
        ]
    },
    packaging: {
        title: 'Packaging Settings',
        key: 'packaging_config',
        fields: [
            {
                name: 'packet_sizes',
                label: 'Packet Sizes',
                type: 'list',
                addItemLabel: 'Add Size',
                columns: [
                    { name: 'size', label: 'Size', type: 'text', placeholder: 'e.g. 50g' },
                    { name: 'enabled', label: 'Enabled', type: 'checkbox' }
                ],
                defaultValue: [{ size: '50g', enabled: true }, { size: '100g', enabled: true }, { size: '250g', enabled: true }, { size: '500g', enabled: true }, { size: '1Kg', enabled: true }]
            },
            {
                name: 'packaging_types',
                label: 'Packaging Types',
                type: 'list',
                addItemLabel: 'Add Type',
                columns: [{ name: 'type', label: 'Type Name', type: 'text' }],
                defaultValue: [{ type: 'Plastic' }, { type: 'Paper' }, { type: 'Tin Box' }]
            },
            { name: 'brand_name', label: 'Label Brand Name', type: 'text' }
        ]
    },
    supplier: {
        title: 'Supplier Settings',
        key: 'supplier_config',
        fields: [
            { name: 'default_payment_terms', label: 'Default Payment Terms', type: 'select', options: ['Cash', 'Credit', 'Advance'] },
            { name: 'gst_required', label: 'Is GST Number Mandatory?', type: 'checkbox' }
        ]
    },
    transport: {
        title: 'Transport & Delivery',
        key: 'transport_config',
        fields: [
            { name: 'transport_charge_type', label: 'Charge Type', type: 'select', options: ['Per Km', 'Per Trip', 'Fixed'] },
            { name: 'charge_rate', label: 'Standard Rate (₹)', type: 'number' },
            {
                name: 'vehicle_types',
                label: 'Vehicle Types',
                type: 'list',
                columns: [{ name: 'type', label: 'Vehicle Type', type: 'text' }],
                defaultValue: [{ type: 'Lorry' }, { type: 'Tempo' }, { type: 'Auto' }]
            }
        ]
    },
    payroll: {
        title: 'Payroll Settings',
        key: 'payroll_config',
        fields: [
            { name: 'salary_types', label: 'Allowed Salary Types', type: 'text', value: 'Daily, Monthly', readonly: true },
            { name: 'overtime_rate', label: 'Overtime Rate (Multiplier)', type: 'number', value: 1.5 },
            { name: 'pf_percent', label: 'PF %', type: 'number', value: 12 },
            { name: 'esi_percent', label: 'ESI %', type: 'number', value: 0.75 }
        ]
    },
    tax: {
        title: 'Tax & Billing Settings',
        key: 'tax_config',
        fields: [
            { name: 'gst_percent', label: 'Default GST %', type: 'number', value: 18 },
            { name: 'invoice_prefix', label: 'Invoice Prefix', type: 'text', value: 'INV-' },
            {
                name: 'payment_modes',
                label: 'Payment Modes',
                type: 'list',
                columns: [{ name: 'mode', label: 'Mode', type: 'text' }],
                defaultValue: [{ mode: 'Cash' }, { mode: 'UPI' }, { mode: 'Bank Transfer' }]
            }
        ]
    },
    reports: {
        title: 'Report Settings',
        key: 'report_config',
        fields: [
            { name: 'export_formats', label: 'Allowed Export Formats', type: 'text', value: 'PDF, Excel', readonly: true },
            { name: 'date_filter_range', label: 'Default Date Range (Days)', type: 'number', value: 30 }
        ]
    },
    security: {
        title: 'Security & Backup',
        key: 'security_config',
        fields: [
            { name: 'password_policy', label: 'Min Password Length', type: 'number', value: 8 },
            { name: 'backup_frequency', label: 'Data Backup Frequency', type: 'select', options: ['Daily', 'Weekly', 'Monthly'] },
            { name: 'restore_enabled', label: 'Allow Restore from UI', type: 'checkbox', value: false }
        ]
    },
    system: {
        title: 'System Settings',
        key: 'system_config',
        fields: [
            { name: 'language', label: 'Language', type: 'select', options: ['English', 'Tamil'] },
            { name: 'date_format', label: 'Date Format', type: 'select', options: ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'] },
            { name: 'sms_alerts', label: 'Enable SMS Alerts', type: 'checkbox' },
            { name: 'email_alerts', label: 'Enable Email Alerts', type: 'checkbox' }
        ]
    }
};

let currentCategory = 'company';

function showSection(category) {
    currentCategory = category;

    // Update Nav
    document.querySelectorAll('.settings-nav-item').forEach(el => {
        el.classList.remove('active', 'bg-gray-50', 'text-purple-600', 'border-purple-500');
        el.classList.add('text-gray-600', 'border-transparent');
    });
    const activeNav = document.getElementById(`nav-${category}`);
    if (activeNav) {
        activeNav.classList.add('active', 'bg-gray-50', 'text-purple-600', 'border-purple-500');
        activeNav.classList.remove('text-gray-600', 'border-transparent');
    }

    renderForm(category);
}

function renderForm(category) {
    const container = document.getElementById('settings-container');
    const config = SECTIONS[category];
    const data = currentSettings[category] || {};

    if (!config) {
        container.innerHTML = '<p class="text-red-500">Configuration not found for this section.</p>';
        return;
    }

    let formHtml = `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${config.title}</h2>
            <p class="text-gray-500 mb-8 border-b pb-4">${config.description || 'Manage your settings below.'}</p>
            
            <form id="settingsForm" onsubmit="handleSave(event)">
                <div class="space-y-6">
    `;

    config.fields.forEach(field => {
        const value = data[field.name] !== undefined ? data[field.name] : (field.defaultValue || '');

        // LIST TYPE (Table)
        if (field.type === 'list') {
            formHtml += `
            <div class="block">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-semibold text-gray-700">${field.label}</label>
                    <button type="button" onclick="addListRow('${field.name}')" class="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded hover:bg-purple-100">
                        <i class="fas fa-plus mr-1"></i> ${field.addItemLabel || 'Add Item'}
                    </button>
                </div>
                <div class="overflow-x-auto border rounded-lg">
                    <table class="w-full text-sm text-left" id="table-${field.name}">
                        <thead class="bg-gray-50 text-gray-700 uppercase">
                            <tr>
                                ${field.columns.map(col => `<th class="px-4 py-3">${col.label}</th>`).join('')}
                                <th class="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody id="tbody-${field.name}">
                            <!-- Rows injected via JS after render -->
                        </tbody>
                    </table>
                </div>
            </div>`;
        }
        // SELECT
        else if (field.type === 'select') {
            formHtml += `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}</label>
                <select name="${field.name}" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition">
                    ${field.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                </select>
            </div>`;
        }
        // CHECKBOX
        else if (field.type === 'checkbox') {
            formHtml += `
            <div class="flex items-center">
                <input type="checkbox" name="${field.name}" id="chk-${field.name}" class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500" ${value ? 'checked' : ''}>
                <label for="chk-${field.name}" class="ml-2 text-sm text-gray-700">${field.label}</label>
            </div>`;
        }
        // TEXTAREA
        else if (field.type === 'textarea') {
            formHtml += `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}</label>
                <textarea name="${field.name}" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition">${value}</textarea>
            </div>`;
        }
        // INPUTS
        else {
            formHtml += `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">${field.label}</label>
                <input type="${field.type}" name="${field.name}" value="${value}" ${field.readonly ? 'readonly' : ''} 
                    class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition ${field.readonly ? 'bg-gray-50 text-gray-500' : ''}" 
                    placeholder="${field.placeholder || ''}">
            </div>`;
        }
    });

    formHtml += `
                </div>
                <div class="mt-8 pt-6 border-t flex justify-end">
                    <button type="submit" class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 font-semibold">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;

    container.innerHTML = formHtml;

    // Post-render: fill list tables
    config.fields.forEach(field => {
        if (field.type === 'list') {
            const listData = data[field.name] || field.defaultValue || [];
            listData.forEach(row => renderListRow(field.name, field.columns, row));
        }
    });
}

function renderListRow(fieldName, columns, rowData = {}) {
    const tbody = document.getElementById(`tbody-${fieldName}`);
    const tr = document.createElement('tr');
    tr.className = 'border-b hover:bg-gray-50 transition';

    let tds = '';
    columns.forEach(col => {
        const val = rowData[col.name] !== undefined ? rowData[col.name] : '';
        const inputType = col.type === 'checkbox' ? 'checkbox' : (col.type === 'number' ? 'number' : 'text');

        if (col.type === 'select') {
            tds += `<td class="p-2"><select data-name="${col.name}" class="w-full border rounded px-2 py-1 text-sm bg-transparent focus:bg-white transition">
                ${col.options.map(opt => `<option value="${opt}" ${val === opt ? 'selected' : ''}>${opt}</option>`).join('')}
             </select></td>`;
        } else if (col.type === 'checkbox') {
            tds += `<td class="p-2 text-center"><input type="checkbox" data-name="${col.name}" class="w-4 h-4" ${val ? 'checked' : ''}></td>`;
        } else {
            tds += `<td class="p-2"><input type="${inputType}" data-name="${col.name}" value="${val}" ${col.readonly ? 'readonly' : ''} class="w-full border rounded px-2 py-1 text-sm bg-transparent focus:bg-white transition ${col.readonly ? 'text-gray-500' : ''}"></td>`;
        }
    });

    tds += `<td class="p-2 text-center"><button type="button" onclick="this.closest('tr').remove()" class="text-red-400 hover:text-red-600"><i class="fas fa-trash"></i></button></td>`;

    tr.innerHTML = tds;
    tbody.appendChild(tr);
}

function addListRow(fieldName) {
    const config = SECTIONS[currentCategory];
    const field = config.fields.find(f => f.name === fieldName);
    if (field) {
        renderListRow(fieldName, field.columns, {});
    }
}

async function loadSettings() {
    try {
        const response = await fetch('../api/settings.php', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        const result = await response.json();

        if (result.settings) {
            // Transform rows to category map
            // structure: { category: { field1: val, field2: val, ... } }
            // API returns: [{category, setting_key, setting_value}]

            const map = {};
            result.settings.forEach(row => {
                let val = row.setting_value;
                try { val = JSON.parse(val); } catch (e) { }

                // If the key matches the "main key" defined in SECTIONS (e.g. 'profile'), assign it to the category object
                // But wait, my SECTIONS define a 'key': 'profile'. 
                // So if row.setting_key === 'profile', then map[row.category] = val

                // Actually, let's just map generic logic
                if (row.setting_key === SECTIONS[row.category]?.key) {
                    map[row.category] = val;
                }
            });

            currentSettings = map;
        }

    } catch (error) {
        console.error('Error loading settings', error);
    } finally {
        showSection(currentCategory);
    }
}

async function handleSave(e) {
    e.preventDefault();

    // Gather data
    const config = SECTIONS[currentCategory];
    const formData = new FormData(e.target);
    const data = {};

    config.fields.forEach(field => {
        if (field.type === 'list') {
            // Scrape table
            const rows = [];
            const tbody = document.getElementById(`tbody-${field.name}`);
            tbody.querySelectorAll('tr').forEach(tr => {
                const rowObj = {};
                tr.querySelectorAll('[data-name]').forEach(input => {
                    const name = input.getAttribute('data-name');
                    if (input.type === 'checkbox') {
                        rowObj[name] = input.checked;
                    } else {
                        rowObj[name] = input.value;
                    }
                });
                // Filter empty rows if needed? No, let user control
                rows.push(rowObj);
            });
            data[field.name] = rows;
        } else if (field.type === 'checkbox') {
            data[field.name] = document.getElementById(`chk-${field.name}`).checked;
        } else {
            data[field.name] = formData.get(field.name);
        }
    });

    const payload = {
        category: currentCategory,
        setting_key: config.key,
        setting_value: data
    };

    try {
        const response = await fetch('../api/settings.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showToast('Settings saved successfully!');
            // Update local cache
            currentSettings[currentCategory] = data;
        } else {
            showToast('Failed to save settings', true);
        }
    } catch (err) {
        console.error(err);
        showToast('Error saving settings', true);
    }
}

function showToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = msg;
    toast.className = `fixed bottom-4 right-4 ${isError ? 'bg-red-600' : 'bg-gray-800'} text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-0 transition-transform duration-300 flex items-center space-x-2`;

    setTimeout(() => {
        toast.className = `fixed bottom-4 right-4 ${isError ? 'bg-red-600' : 'bg-gray-800'} text-white px-6 py-3 rounded-lg shadow-lg transform translate-y-20 transition-transform duration-300 flex items-center space-x-2`;
    }, 3000);
}
