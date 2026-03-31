<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sql = 'SELECT * FROM purchase_orders ORDER BY created_at DESC';
        $stmt = db()->query($sql);
        $rows = $stmt->fetchAll();
        json_response(['purchase_orders' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = [
            'purchase_date',
            'supplier_id',
            'supplier_name',
            'supplier_address',
            'supplier_contact',
            'supplier_email',
            'material_name',
            'unit_price',
            'quantity',
            'total_cost',
            'purchase_status',
            'transport_mode',
            'delivery_status'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Validate numeric fields
        $unitPrice = (float)$payload['unit_price'];
        $quantity = (float)$payload['quantity'];
        $totalCost = (float)$payload['total_cost'];

        if (!is_numeric((string)$payload['unit_price']) || $unitPrice < 0) {
            json_response(['error' => 'unit_price must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['quantity']) || $quantity < 0) {
            json_response(['error' => 'quantity must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['total_cost']) || $totalCost < 0) {
            json_response(['error' => 'total_cost must be a non-negative number'], 422);
        }

        // Validate enums
        $validStatuses = ['approved', 'delivered', 'cancelled', 'pending'];
        if (!in_array($payload['purchase_status'], $validStatuses, true)) {
            json_response(['error' => 'Invalid purchase_status'], 422);
        }

        $validMaterials = ['green leaf', 'tea powder', 'labelling & stickers', 'tin containers', 'fuel', 'chemicals'];
        if (!in_array($payload['material_name'], $validMaterials, true)) {
            json_response(['error' => 'Invalid material_name'], 422);
        }

        $validTransport = ['lorry', 'auto', 'tempo'];
        if (!in_array($payload['transport_mode'], $validTransport, true)) {
            json_response(['error' => 'Invalid transport_mode'], 422);
        }

        $validDelivery = ['received', 'not received'];
        if (!in_array($payload['delivery_status'], $validDelivery, true)) {
            json_response(['error' => 'Invalid delivery_status'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO purchase_orders (
                purchase_date, delivery_date, supplier_id, supplier_name,
                supplier_address, supplier_contact, supplier_email,
                material_name, unit_price, quantity, total_cost,
                purchase_status, transport_mode, delivery_status, remarks
            ) VALUES (
                :purchase_date, :delivery_date, :supplier_id, :supplier_name,
                :supplier_address, :supplier_contact, :supplier_email,
                :material_name, :unit_price, :quantity, :total_cost,
                :purchase_status, :transport_mode, :delivery_status, :remarks
            )'
        );

        $stmt->execute([
            'purchase_date' => $payload['purchase_date'],
            'delivery_date' => $payload['delivery_date'] ?? null,
            'supplier_id' => trim((string)$payload['supplier_id']),
            'supplier_name' => trim((string)$payload['supplier_name']),
            'supplier_address' => trim((string)$payload['supplier_address']),
            'supplier_contact' => trim((string)$payload['supplier_contact']),
            'supplier_email' => trim((string)$payload['supplier_email']),
            'material_name' => $payload['material_name'],
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'total_cost' => $totalCost,
            'purchase_status' => $payload['purchase_status'],
            'transport_mode' => $payload['transport_mode'],
            'delivery_status' => $payload['delivery_status'],
            'remarks' => $payload['remarks'] ?? null ? trim((string)$payload['remarks']) : null,
        ]);

        $purchaseId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM purchase_orders WHERE purchase_id = :purchase_id LIMIT 1');
        $stmt->execute(['purchase_id' => $purchaseId]);
        $created = $stmt->fetch();

        json_response(['purchase_order' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Purchase Order API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}
