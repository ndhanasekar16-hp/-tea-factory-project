<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $suppliersStatus = $_GET['suppliers_status'] ?? null;
        $supplierType = $_GET['supplier_type'] ?? null;

        $sql = 'SELECT * FROM suppliers WHERE 1=1';
        $params = [];

        if (!empty($suppliersStatus)) {
            $sql .= ' AND suppliers_status = :suppliers_status';
            $params['suppliers_status'] = $suppliersStatus;
        }

        if (!empty($supplierType)) {
            $sql .= ' AND supplier_type = :supplier_type';
            $params['supplier_type'] = $supplierType;
        }

        $sql .= ' ORDER BY created_at DESC, supply_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['suppliers' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = [
            'supplier_id',
            'supplier_name',
            'contact_person',
            'email_id',
            'address',
            'location',
            'supply_date',
            'price_per_kg',
            'quantity',
            'supplier_type',
            'item_supplied',
            'supply_frequency',
            'suppliers_status',
            'suppliers_work'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Validate email
        if (!filter_var($payload['email_id'], FILTER_VALIDATE_EMAIL)) {
            json_response(['error' => 'email_id is invalid'], 422);
        }

        // Validate numeric fields
        $pricePerKg = (float)$payload['price_per_kg'];
        $quantity = (float)$payload['quantity'];

        if (!is_numeric((string)$payload['price_per_kg']) || $pricePerKg < 0) {
            json_response(['error' => 'price_per_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['quantity']) || $quantity < 0) {
            json_response(['error' => 'quantity must be a non-negative number'], 422);
        }

        // Validate supplier_type
        $validSupplierTypes = ['raw material supplier', 'leaf supplier', 'service suppliers'];
        if (!in_array($payload['supplier_type'], $validSupplierTypes, true)) {
            json_response(['error' => 'supplier_type is invalid'], 422);
        }

        // Validate item_supplied
        $validItems = ['green leaf', 'tea powder', 'packing material'];
        if (!in_array($payload['item_supplied'], $validItems, true)) {
            json_response(['error' => 'item_supplied is invalid'], 422);
        }

        // Validate supply_frequency
        $validFrequencies = ['daily', 'weekly', 'monthly'];
        if (!in_array($payload['supply_frequency'], $validFrequencies, true)) {
            json_response(['error' => 'supply_frequency is invalid'], 422);
        }

        // Validate suppliers_status
        $validStatuses = ['active', 'inactive'];
        if (!in_array($payload['suppliers_status'], $validStatuses, true)) {
            json_response(['error' => 'suppliers_status is invalid'], 422);
        }

        // Validate suppliers_work
        $validWorkStatuses = ['completed', 'pending', 'not completed', 'rejected'];
        if (!in_array($payload['suppliers_work'], $validWorkStatuses, true)) {
            json_response(['error' => 'suppliers_work is invalid'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO suppliers (
                supplier_id, supplier_name, contact_person, email_id, address, location,
                supply_date, gst_no, inspection_date, price_per_kg, contract_id,
                contract_status, quantity, supplier_type, item_supplied, supply_frequency,
                suppliers_status, suppliers_work, remarks
            ) VALUES (
                :supplier_id, :supplier_name, :contact_person, :email_id, :address, :location,
                :supply_date, :gst_no, :inspection_date, :price_per_kg, :contract_id,
                :contract_status, :quantity, :supplier_type, :item_supplied, :supply_frequency,
                :suppliers_status, :suppliers_work, :remarks
            )'
        );

        $stmt->execute([
            'supplier_id' => trim((string)$payload['supplier_id']),
            'supplier_name' => trim((string)$payload['supplier_name']),
            'contact_person' => trim((string)$payload['contact_person']),
            'email_id' => trim((string)$payload['email_id']),
            'address' => trim((string)$payload['address']),
            'location' => trim((string)$payload['location']),
            'supply_date' => $payload['supply_date'],
            'gst_no' => $payload['gst_no'] ?? null ? trim((string)$payload['gst_no']) : null,
            'inspection_date' => $payload['inspection_date'] ?? null ? trim((string)$payload['inspection_date']) : null,
            'price_per_kg' => $pricePerKg,
            'contract_id' => $payload['contract_id'] ?? null ? trim((string)$payload['contract_id']) : null,
            'contract_status' => $payload['contract_status'] ?? null ? trim((string)$payload['contract_status']) : null,
            'quantity' => $quantity,
            'supplier_type' => $payload['supplier_type'],
            'item_supplied' => $payload['item_supplied'],
            'supply_frequency' => $payload['supply_frequency'],
            'suppliers_status' => $payload['suppliers_status'],
            'suppliers_work' => $payload['suppliers_work'],
            'remarks' => $payload['remarks'] ?? null ? trim((string)$payload['remarks']) : null,
        ]);

        $supplyId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM suppliers WHERE supply_id = :supply_id LIMIT 1');
        $stmt->execute(['supply_id' => $supplyId]);
        $created = $stmt->fetch();

        json_response(['supplier' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Suppliers API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

