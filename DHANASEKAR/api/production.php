<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $productionDate = $_GET['production_date'] ?? null;
        $leafType = $_GET['leaf_type'] ?? null;
        $quality = $_GET['production_quality'] ?? null;

        $sql = 'SELECT * FROM productions WHERE 1=1';
        $params = [];

        if (!empty($productionDate)) {
            $sql .= ' AND production_date = :production_date';
            $params['production_date'] = $productionDate;
        }

        if (!empty($leafType)) {
            $sql .= ' AND leaf_type = :leaf_type';
            $params['leaf_type'] = $leafType;
        }

        if (!empty($quality)) {
            $sql .= ' AND production_quality = :production_quality';
            $params['production_quality'] = $quality;
        }

        $sql .= ' ORDER BY production_date DESC, production_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['productions' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['production_date', 'production_cost', 'operator_id', 'leaf_type', 'production_quantity_kg', 'production_quality'];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        $qty = (float)$payload['production_quantity_kg'];
        $cost = (float)$payload['production_cost'];

        if (!is_numeric((string)$payload['production_quantity_kg']) || $qty <= 0) {
            json_response(['error' => 'production_quantity_kg must be a positive number'], 422);
        }

        if (!is_numeric((string)$payload['production_cost']) || $cost < 0) {
            json_response(['error' => 'production_cost must be a non-negative number'], 422);
        }

        $validLeafTypes = [
            'Green Leaves',
            'Bud Leaves',
            'Rolled Leaves',
            'Mature Leaves',
            'Dry Leaves',
        ];

        if (!in_array($payload['leaf_type'], $validLeafTypes, true)) {
            json_response(['error' => 'leaf_type is invalid'], 422);
        }

        $validQualities = ['A', 'B', 'C', 'D'];
        if (!in_array($payload['production_quality'], $validQualities, true)) {
            json_response(['error' => 'production_quality must be one of A, B, C, D'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO productions (production_date, production_cost, operator_id, leaf_type, production_quantity_kg, production_quality, remarks)
             VALUES (:production_date, :production_cost, :operator_id, :leaf_type, :production_quantity_kg, :production_quality, :remarks)'
        );

        $stmt->execute([
            'production_date' => $payload['production_date'],
            'production_cost' => $cost,
            'operator_id' => trim((string)$payload['operator_id']),
            'leaf_type' => $payload['leaf_type'],
            'production_quantity_kg' => $qty,
            'production_quality' => $payload['production_quality'],
            'remarks' => $payload['remarks'] !== '' ? trim((string)$payload['remarks']) : null,
        ]);

        $productionId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM productions WHERE production_id = :production_id LIMIT 1');
        $stmt->execute(['production_id' => $productionId]);
        $created = $stmt->fetch();

        json_response(['production' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Production API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


