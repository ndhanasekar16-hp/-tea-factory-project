<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $teaType = $_GET['tea_type'] ?? null;
        $grade = $_GET['grade'] ?? null;

        $sql = 'SELECT * FROM inventory WHERE 1=1';
        $params = [];

        if (!empty($teaType)) {
            $sql .= ' AND tea_type = :tea_type';
            $params['tea_type'] = $teaType;
        }

        if (!empty($grade)) {
            $sql .= ' AND grade = :grade';
            $params['grade'] = $grade;
        }

        $sql .= ' ORDER BY created_at DESC, inventory_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['inventory' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = [
            'product_name',
            'product_code',
            'packing_date',
            'tea_type',
            'grade',
            'storage_condition',
            'opening_stock_kg',
            'current_stock_kg',
            'damaged_stock_kg',
            'total_stock_value',
            'selling_price',
            'cost_per_kg'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Validate numeric fields
        $openingStock = (float)$payload['opening_stock_kg'];
        $currentStock = (float)$payload['current_stock_kg'];
        $damagedStock = (float)$payload['damaged_stock_kg'];
        $totalStockValue = (float)$payload['total_stock_value'];
        $sellingPrice = (float)$payload['selling_price'];
        $costPerKg = (float)$payload['cost_per_kg'];

        if (!is_numeric((string)$payload['opening_stock_kg']) || $openingStock < 0) {
            json_response(['error' => 'opening_stock_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['current_stock_kg']) || $currentStock < 0) {
            json_response(['error' => 'current_stock_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['damaged_stock_kg']) || $damagedStock < 0) {
            json_response(['error' => 'damaged_stock_kg must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['total_stock_value']) || $totalStockValue < 0) {
            json_response(['error' => 'total_stock_value must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['selling_price']) || $sellingPrice < 0) {
            json_response(['error' => 'selling_price must be a non-negative number'], 422);
        }

        if (!is_numeric((string)$payload['cost_per_kg']) || $costPerKg < 0) {
            json_response(['error' => 'cost_per_kg must be a non-negative number'], 422);
        }

        // Validate tea type
        $validTeaTypes = ['Green tea', 'black tea', 'herbal tea', 'plucked tea'];
        if (!in_array($payload['tea_type'], $validTeaTypes, true)) {
            json_response(['error' => 'tea_type is invalid'], 422);
        }

        // Validate grade
        $validGrades = ['OP', 'BOP', 'FBOP', 'Fannings', 'Dust'];
        if (!in_array($payload['grade'], $validGrades, true)) {
            json_response(['error' => 'grade is invalid'], 422);
        }

        // Validate storage condition
        $validStorageConditions = ['cool', 'dry', 'hot', 'cold', 'ventilated'];
        if (!in_array($payload['storage_condition'], $validStorageConditions, true)) {
            json_response(['error' => 'storage_condition is invalid'], 422);
        }

        // Validate temperature if provided
        $temperature = null;
        if (isset($payload['temperature']) && $payload['temperature'] !== '' && $payload['temperature'] !== null) {
            $temperature = (float)$payload['temperature'];
            if (!is_numeric((string)$payload['temperature'])) {
                json_response(['error' => 'temperature must be a number'], 422);
            }
        }

        $stmt = db()->prepare(
            'INSERT INTO inventory (
                product_name, product_code, packing_date, expired_date, tea_type, grade,
                storage_condition, temperature, storage_location, opening_stock_kg,
                current_stock_kg, damaged_stock_kg, total_stock_value, selling_price,
                cost_per_kg, used_in, remarks
            ) VALUES (
                :product_name, :product_code, :packing_date, :expired_date, :tea_type, :grade,
                :storage_condition, :temperature, :storage_location, :opening_stock_kg,
                :current_stock_kg, :damaged_stock_kg, :total_stock_value, :selling_price,
                :cost_per_kg, :used_in, :remarks
            )'
        );

        $stmt->execute([
            'product_name' => trim((string)$payload['product_name']),
            'product_code' => trim((string)$payload['product_code']),
            'packing_date' => $payload['packing_date'],
            'expired_date' => $payload['expired_date'] ?? null,
            'tea_type' => $payload['tea_type'],
            'grade' => $payload['grade'],
            'storage_condition' => $payload['storage_condition'],
            'temperature' => $temperature,
            'storage_location' => $payload['storage_location'] ?? null ? trim((string)$payload['storage_location']) : null,
            'opening_stock_kg' => $openingStock,
            'current_stock_kg' => $currentStock,
            'damaged_stock_kg' => $damagedStock,
            'total_stock_value' => $totalStockValue,
            'selling_price' => $sellingPrice,
            'cost_per_kg' => $costPerKg,
            'used_in' => $payload['used_in'] ?? null ? trim((string)$payload['used_in']) : null,
            'remarks' => $payload['remarks'] ?? null ? trim((string)$payload['remarks']) : null,
        ]);

        $inventoryId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM inventory WHERE inventory_id = :inventory_id LIMIT 1');
        $stmt->execute(['inventory_id' => $inventoryId]);
        $created = $stmt->fetch();

        json_response(['inventory' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Inventory API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

