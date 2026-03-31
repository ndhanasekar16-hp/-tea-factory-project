// API Configuration
const API_BASE_URL = 'http://localhost/Bacend/api/';

// State
let allTransports = [];
let filteredTransports = [];

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

    setupTransportEventListeners();
    loadTransports();
});

// Setup event listeners
function setupTransportEventListeners() {
    const form = document.getElementById('transportForm');
    if (form) {
        form.addEventListener('submit', handleTransportSubmit);
    }

    const applyBtn = document.getElementById('applyTransportFiltersBtn');
    const resetBtn = document.getElementById('resetTransportFiltersBtn');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const vehicleType = document.getElementById('filterVehicleType').value;
            const materialType = document.getElementById('filterMaterialType').value;
            loadTransports({ vehicle_type: vehicleType, material_type: materialType });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            document.getElementById('filterVehicleType').value = '';
            document.getElementById('filterMaterialType').value = '';
            loadTransports();
        });
    }

    // Set default transport date to today
    const transportDateInput = document.getElementById('transportDate');
    if (transportDateInput && !transportDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        transportDateInput.value = today;
    }
}

// API Helper
async function transportApiCall(endpoint, method = 'GET', body = null) {
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

    const response = await fetch(API_BASE_URL + endpoint, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Load transports with optional filters
async function loadTransports(filters = {}) {
    const tbody = document.getElementById('transportTableBody');
    const emptyState = document.getElementById('transportEmptyState');

    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                        <div class="loader mb-4"></div>
                        <p>Loading transport records...</p>
                    </div>
                </td>
            </tr>
        `;
    }
    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    try {
        const params = new URLSearchParams();
        if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
        if (filters.material_type) params.append('material_type', filters.material_type);

        const endpoint = 'transport.php' + (params.toString() ? `?${params.toString()}` : '');
        const result = await transportApiCall(endpoint, 'GET');

        allTransports = result.transports || [];
        filteredTransports = [...allTransports];
        renderTransports();
    } catch (error) {
        console.error('Error loading transports:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-8 text-center text-red-500">
                        <i class="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>Error loading transport records. Please try again.</p>
                    </td>
                </tr>
            `;
        }
    }
}

// Render table
function renderTransports() {
    const tbody = document.getElementById('transportTableBody');
    const emptyState = document.getElementById('transportEmptyState');

    if (!tbody) return;

    if (!filteredTransports.length) {
        tbody.innerHTML = '';
        if (emptyState) {
            emptyState.classList.remove('hidden');
        }
        return;
    }

    if (emptyState) {
        emptyState.classList.add('hidden');
    }

    tbody.innerHTML = filteredTransports.map(item => {
        const route = item.source_location && item.destination_location
            ? `${escapeHtml(item.source_location)} â†’ ${escapeHtml(item.destination_location)}`
            : '-';
        
        const deliverStatus = item.deliver_confirmation === 'yes' 
            ? '<span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Delivered</span>'
            : '<span class="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>';

        return `
            <tr>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    #${item.transport_id}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    ${escapeHtml(item.vehicle_number || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.driver_name || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${escapeHtml(item.vehicle_type || '')}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    ${route}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${Number(item.quantity_kg || 0).toFixed(2)}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                    ${deliverStatus}
                </td>
            </tr>
        `;
    }).join('');
}

// Handle form submit
async function handleTransportSubmit(e) {
    e.preventDefault();

    const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
    const driverName = document.getElementById('driverName').value.trim();
    const driverId = document.getElementById('driverId').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const licenseNumber = document.getElementById('licenseNumber').value.trim();
    const vehicleCapacity = document.getElementById('vehicleCapacity').value;
    const sourceLocation = document.getElementById('sourceLocation').value.trim();
    const destinationLocation = document.getElementById('destinationLocation').value.trim();
    const gpsTrackingId = document.getElementById('gpsTrackingId').value.trim();
    const distanceKm = document.getElementById('distanceKm').value;
    const quantityKg = document.getElementById('quantityKg').value;
    const costPerKg = document.getElementById('costPerKg').value;
    const fuelConsumptionLtrs = document.getElementById('fuelConsumptionLtrs').value;
    const fuelCost = document.getElementById('fuelCost').value;
    const tollCharges = document.getElementById('tollCharges').value;
    const transportDate = document.getElementById('transportDate').value;
    const deliveredDate = document.getElementById('deliveredDate').value;
    const startingTime = document.getElementById('startingTime').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    const delayReason = document.getElementById('delayReason').value.trim();
    const vehicleType = document.getElementById('vehicleType').value;
    const materialType = document.getElementById('materialType').value;
    const packagingType = document.getElementById('packagingType').value;
    const deliverConfirmation = document.getElementById('deliverConfirmation').value;
    const receiverName = document.getElementById('receiverName').value.trim();
    const receiverSignature = document.getElementById('receiverSignature').value.trim();
    const remarks = document.getElementById('remarks').value.trim();

    const errorEl = document.getElementById('transportError');
    const successEl = document.getElementById('transportSuccess');
    const submitText = document.getElementById('transportSubmitText');
    const submitLoader = document.getElementById('transportSubmitLoader');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    // Validate required fields
    if (!vehicleNumber || !driverName || !driverId || !contactNumber || !licenseNumber ||
        !vehicleCapacity || !sourceLocation || !destinationLocation || !distanceKm ||
        !quantityKg || !costPerKg || !fuelConsumptionLtrs || !fuelCost || !tollCharges ||
        !transportDate || !startingTime || !vehicleType || !materialType || !packagingType ||
        !deliverConfirmation) {
        if (errorEl) {
            errorEl.textContent = 'Please fill all required fields.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    // Validate numeric fields
    const vehicleCapacityValue = parseFloat(vehicleCapacity);
    const distanceKmValue = parseFloat(distanceKm);
    const quantityKgValue = parseFloat(quantityKg);
    const costPerKgValue = parseFloat(costPerKg);
    const fuelConsumptionValue = parseFloat(fuelConsumptionLtrs);
    const fuelCostValue = parseFloat(fuelCost);
    const tollChargesValue = parseFloat(tollCharges);

    if (isNaN(vehicleCapacityValue) || vehicleCapacityValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Vehicle capacity must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(distanceKmValue) || distanceKmValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Distance must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(quantityKgValue) || quantityKgValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Quantity must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(costPerKgValue) || costPerKgValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Cost per kg must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(fuelConsumptionValue) || fuelConsumptionValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Fuel consumption must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(fuelCostValue) || fuelCostValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Fuel cost must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (isNaN(tollChargesValue) || tollChargesValue < 0) {
        if (errorEl) {
            errorEl.textContent = 'Toll charges must be a non-negative number.';
            errorEl.classList.remove('hidden');
        }
        return;
    }

    if (submitText) submitText.classList.add('hidden');
    if (submitLoader) submitLoader.classList.remove('hidden');

    try {
        const payload = {
            vehicle_number: vehicleNumber,
            driver_name: driverName,
            driver_id: driverId,
            contact_number: contactNumber,
            license_number: licenseNumber,
            vehicle_capacity: vehicleCapacityValue,
            source_location: sourceLocation,
            destination_location: destinationLocation,
            gps_tracking_id: gpsTrackingId || null,
            distance_km: distanceKmValue,
            quantity_kg: quantityKgValue,
            cost_per_kg: costPerKgValue,
            fuel_consumption_ltrs: fuelConsumptionValue,
            fuel_cost: fuelCostValue,
            toll_charges: tollChargesValue,
            transport_date: transportDate,
            delivered_date: deliveredDate || null,
            starting_time: startingTime,
            arrival_time: arrivalTime || null,
            delay_reason: delayReason || null,
            vehicle_type: vehicleType,
            material_type: materialType,
            packaging_type: packagingType,
            deliver_confirmation: deliverConfirmation,
            receiver_name: receiverName || null,
            receiver_signature: receiverSignature || null,
            remarks: remarks || null
        };

        const result = await transportApiCall('transport.php', 'POST', payload);

        if (successEl) {
            successEl.textContent = 'Transport record saved successfully.';
            successEl.classList.remove('hidden');
        }

        // Reset form except transport date
        document.getElementById('vehicleNumber').value = '';
        document.getElementById('driverName').value = '';
        document.getElementById('driverId').value = '';
        document.getElementById('contactNumber').value = '';
        document.getElementById('licenseNumber').value = '';
        document.getElementById('vehicleCapacity').value = '';
        document.getElementById('sourceLocation').value = '';
        document.getElementById('destinationLocation').value = '';
        document.getElementById('gpsTrackingId').value = '';
        document.getElementById('distanceKm').value = '';
        document.getElementById('quantityKg').value = '';
        document.getElementById('costPerKg').value = '';
        document.getElementById('fuelConsumptionLtrs').value = '';
        document.getElementById('fuelCost').value = '';
        document.getElementById('tollCharges').value = '';
        document.getElementById('deliveredDate').value = '';
        document.getElementById('startingTime').value = '';
        document.getElementById('arrivalTime').value = '';
        document.getElementById('delayReason').value = '';
        document.getElementById('vehicleType').value = '';
        document.getElementById('materialType').value = '';
        document.getElementById('packagingType').value = '';
        document.getElementById('deliverConfirmation').value = '';
        document.getElementById('receiverName').value = '';
        document.getElementById('receiverSignature').value = '';
        document.getElementById('remarks').value = '';

        await loadTransports();
    } catch (error) {
        console.error('Error saving transport:', error);
        if (errorEl) {
            errorEl.textContent = error.message || 'Failed to save transport record.';
            errorEl.classList.remove('hidden');
        }
    } finally {
        if (submitText) submitText.classList.remove('hidden');
        if (submitLoader) submitLoader.classList.add('hidden');
    }
}

// Simple escape helper
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


