<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $vehicleType = $_GET['vehicle_type'] ?? null;
        $materialType = $_GET['material_type'] ?? null;

        $sql = 'SELECT * FROM transport WHERE 1=1';
        $params = [];

        if (!empty($vehicleType)) {
            $sql .= ' AND vehicle_type = :vehicle_type';
            $params['vehicle_type'] = $vehicleType;
        }

        if (!empty($materialType)) {
            $sql .= ' AND material_type = :material_type';
            $params['material_type'] = $materialType;
        }

        $sql .= ' ORDER BY created_at DESC, transport_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['transports' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = [
            'vehicle_number',
            'driver_name',
            'driver_id',
            'contact_number',
            'license_number',
            'vehicle_capacity',
            'source_location',
            'destination_location',
            'distance_km',
            'quantity_kg',
            'cost_per_kg',
            'fuel_consumption_ltrs',
            'fuel_cost',
            'toll_charges',
            'transport_date',
            'starting_time',
            'vehicle_type',
            'material_type',
            'packaging_type',
            'deliver_confirmation'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Validate numeric fields
        $vehicleCapacity = (float)$payload['vehicle_capacity'];
        $distanceKm = (float)$payload['distance_km'];
        $quantityKg = (float)$payload['quantity_kg'];
        $costPerKg = (float)$payload['cost_per_kg'];
        $fuelConsumption = (float)$payload['fuel_consumption_ltrs'];
        $fuelCost = (float)$payload['fuel_cost'];
        $tollCharges = (float)$payload['toll_charges'];

        if (!is_numeric((string)$payload['vehicle_capacity']) || $vehicleCapacity < 0) {
            json_response(['error' => 'vehicle_capacity must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['distance_km']) || $distanceKm < 0) {
            json_response(['error' => 'distance_km must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['quantity_kg']) || $quantityKg < 0) {
            json_response(['error' => 'quantity_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['cost_per_kg']) || $costPerKg < 0) {
            json_response(['error' => 'cost_per_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['fuel_consumption_ltrs']) || $fuelConsumption < 0) {
            json_response(['error' => 'fuel_consumption_ltrs must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['fuel_cost']) || $fuelCost < 0) {
            json_response(['error' => 'fuel_cost must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['toll_charges']) || $tollCharges < 0) {
            json_response(['error' => 'toll_charges must be a non-negative number'], 422);
        }

        // Validate vehicle_type
        $validVehicleTypes = ['Lorry', 'truck', 'tempo', 'container', 'auto'];
        if (!in_array($payload['vehicle_type'], $validVehicleTypes, true)) {
            json_response(['error' => 'vehicle_type is invalid'], 422);
        }

        // Validate material_type
        $validMaterialTypes = [
            'green leaf',
            'tea powder',
            'gunny bags',
            'tin containers',
            'labels & stickers',
            'machinery parts',
            'fuels',
            'chemicals'
        ];
        if (!in_array($payload['material_type'], $validMaterialTypes, true)) {
            json_response(['error' => 'material_type is invalid'], 422);
        }

        // Validate packaging_type
        $validPackagingTypes = [
            'zip lock pouches',
            'plastic tray boxes',
            'wooden crates',
            'jute bags',
            'ventilated bags'
        ];
        if (!in_array($payload['packaging_type'], $validPackagingTypes, true)) {
            json_response(['error' => 'packaging_type is invalid'], 422);
        }

        // Validate deliver_confirmation
        $validConfirmations = ['yes', 'no'];
        if (!in_array($payload['deliver_confirmation'], $validConfirmations, true)) {
            json_response(['error' => 'deliver_confirmation must be yes or no'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO transport (
                vehicle_number, driver_name, driver_id, contact_number, license_number,
                vehicle_capacity, source_location, destination_location, gps_tracking_id,
                distance_km, quantity_kg, cost_per_kg, fuel_consumption_ltrs, fuel_cost,
                toll_charges, transport_date, delivered_date, starting_time, arrival_time,
                delay_reason, vehicle_type, material_type, packaging_type, deliver_confirmation,
                receiver_name, receiver_signature, remarks
            ) VALUES (
                :vehicle_number, :driver_name, :driver_id, :contact_number, :license_number,
                :vehicle_capacity, :source_location, :destination_location, :gps_tracking_id,
                :distance_km, :quantity_kg, :cost_per_kg, :fuel_consumption_ltrs, :fuel_cost,
                :toll_charges, :transport_date, :delivered_date, :starting_time, :arrival_time,
                :delay_reason, :vehicle_type, :material_type, :packaging_type, :deliver_confirmation,
                :receiver_name, :receiver_signature, :remarks
            )'
        );

        $stmt->execute([
            'vehicle_number' => trim((string)$payload['vehicle_number']),
            'driver_name' => trim((string)$payload['driver_name']),
            'driver_id' => trim((string)$payload['driver_id']),
            'contact_number' => trim((string)$payload['contact_number']),
            'license_number' => trim((string)$payload['license_number']),
            'vehicle_capacity' => $vehicleCapacity,
            'source_location' => trim((string)$payload['source_location']),
            'destination_location' => trim((string)$payload['destination_location']),
            'gps_tracking_id' => $payload['gps_tracking_id'] ?? null ? trim((string)$payload['gps_tracking_id']) : null,
            'distance_km' => $distanceKm,
            'quantity_kg' => $quantityKg,
            'cost_per_kg' => $costPerKg,
            'fuel_consumption_ltrs' => $fuelConsumption,
            'fuel_cost' => $fuelCost,
            'toll_charges' => $tollCharges,
            'transport_date' => $payload['transport_date'],
            'delivered_date' => $payload['delivered_date'] ?? null,
            'starting_time' => $payload['starting_time'],
            'arrival_time' => $payload['arrival_time'] ?? null,
            'delay_reason' => $payload['delay_reason'] ?? null ? trim((string)$payload['delay_reason']) : null,
            'vehicle_type' => $payload['vehicle_type'],
            'material_type' => $payload['material_type'],
            'packaging_type' => $payload['packaging_type'],
            'deliver_confirmation' => $payload['deliver_confirmation'],
            'receiver_name' => $payload['receiver_name'] ?? null ? trim((string)$payload['receiver_name']) : null,
            'receiver_signature' => $payload['receiver_signature'] ?? null ? trim((string)$payload['receiver_signature']) : null,
            'remarks' => $payload['remarks'] ?? null ? trim((string)$payload['remarks']) : null,
        ]);

        $transportId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM transport WHERE transport_id = :transport_id LIMIT 1');
        $stmt->execute(['transport_id' => $transportId]);
        $created = $stmt->fetch();

        json_response(['transport' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Transport API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

