document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const token = localStorage.getItem('authToken');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // Set user info in sidebar/header
    document.getElementById('userInitials').textContent = (user.full_name || 'U').charAt(0).toUpperCase();
    document.getElementById('userName').textContent = user.full_name || 'User';

    // Attempt to set email in sidebar if element exists (it should based on template)
    const emailEl = document.getElementById('userEmail');
    if (emailEl) emailEl.textContent = user.email || '';

    // Load initial data
    fetchPayroll();

    // Setup event listeners
    document.getElementById('payrollForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('filterType').addEventListener('change', fetchPayroll);

    // Setup Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterTableLocally(searchTerm);
    });
});

let payrollData = [];

function toggleForm() {
    const form = document.getElementById('payrollFormContainer');
    form.classList.toggle('hidden');
}

function handleTypeChange() {
    const type = document.getElementById('paymentTypeSelect').value;

    // Hide all specific sections first
    document.getElementById('employeeSection').classList.add('hidden');
    document.getElementById('supplierSection').classList.add('hidden');
    document.getElementById('transportSection').classList.add('hidden');

    // Show relevant section
    if (type === 'salary') {
        document.getElementById('employeeSection').classList.remove('hidden');
    } else if (type === 'supplier') {
        document.getElementById('supplierSection').classList.remove('hidden');
    } else if (type === 'transport') {
        document.getElementById('transportSection').classList.remove('hidden');
    }
}

async function fetchPayroll() {
    const filterType = document.getElementById('filterType').value;
    let url = '../api/payroll.php';
    if (filterType) {
        url += `?payment_type=${filterType}`;
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();
        
        let allData = data.payroll || [];
        
        if (typeof RoleUtils !== 'undefined' && RoleUtils.shouldFilterToCurrentUser()) {
            const currentUser = RoleUtils.getCurrentUser();
            allData = allData.filter(item => 
                (item.employee_id && item.employee_id.replace('EMP-', '') == currentUser.id) || 
                (item.payee_name && item.payee_name.toLowerCase() === currentUser.full_name.toLowerCase())
            );
        }
        
        payrollData = allData;
        renderTable(payrollData);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('payrollTableBody').innerHTML = `
            <tr><td colspan="7" class="p-4 text-center text-red-500">Error loading data</td></tr>
        `;
    }
}

function renderTable(data) {
    const tbody = document.getElementById('payrollTableBody');
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-4 text-center text-gray-500">No records found</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => `
        <tr class="border-b hover:bg-gray-50 transition">
            <td class="p-4 text-gray-600">#${item.payroll_id}</td>
            <td class="p-4 text-gray-800">${item.payment_date}</td>
            <td class="p-4 font-semibold text-gray-800">${item.payee_name || '-'}</td>
            <td class="p-4"><span class="px-2 py-1 bg-gray-200 rounded text-sm capitalize">${item.payment_type}</span></td>
            <td class="p-4 uppercase text-sm text-gray-600">${item.payment_mode}</td>
            <td class="p-4 font-bold text-gray-800">₹${parseFloat(item.amount).toLocaleString()}</td>
            <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.payment_status)}">
                    ${item.payment_status}
                </span>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'paid': return 'bg-green-100 text-green-700';
        case 'pending': return 'bg-yellow-100 text-yellow-700';
        case 'not paid': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const payload = {};

    // Convert FormData to JSON object, handling types
    for (let [key, value] of formData.entries()) {
        payload[key] = value;
    }

    // Basic client-side validation for numeric fields
    /* Note: HTML5 type="number" handles basic validation, but good to ensure correct types */

    try {
        const response = await fetch('../api/payroll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || 'Failed to save payroll entry');
            return;
        }

        // Success
        alert('Payroll entry saved successfully!');
        e.target.reset();
        toggleForm();
        fetchPayroll(); // Refresh list

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving.');
    }
}

function filterTableLocally(searchTerm) {
    if (!searchTerm) {
        renderTable(payrollData);
        return;
    }

    const filtered = payrollData.filter(item =>
        (item.payee_name && item.payee_name.toLowerCase().includes(searchTerm)) ||
        (item.transaction_id && item.transaction_id.toLowerCase().includes(searchTerm)) ||
        item.payroll_id.toString().includes(searchTerm)
    );

    renderTable(filtered);
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
