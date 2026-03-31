<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

$user = ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $date = $_GET['date'] ?? null;
        $grade = $_GET['grade'] ?? null;
        $employee_id = $_GET['employee_id'] ?? null;

        $sql = 'SELECT * FROM leaf_collections WHERE 1=1';
        $params = [];

        if (!empty($date)) {
            $sql .= ' AND collection_date = :collection_date';
            $params['collection_date'] = $date;
        }

        if (!empty($grade)) {
            $sql .= ' AND leaf_grade = :leaf_grade';
            $params['leaf_grade'] = $grade;
        }

        if (!empty($employee_id)) {
            $sql .= ' AND employee_id = :employee_id';
            $params['employee_id'] = $employee_id;
        }

        $sql .= ' ORDER BY collection_date DESC, farmer_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['leaf_collections' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['collection_date', 'bought_from', 'leaf_quantity_kg', 'leaf_grade'];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        $qty = (float)$payload['leaf_quantity_kg'];
        if (!is_numeric((string)$payload['leaf_quantity_kg']) || $qty <= 0) {
            json_response(['error' => 'leaf_quantity_kg must be a positive number'], 422);
        }

        $validGrades = ['A', 'B', 'C', 'D'];
        if (!in_array($payload['leaf_grade'], $validGrades, true)) {
            json_response(['error' => 'leaf_grade must be one of A, B, C, D'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO leaf_collections (collection_date, bought_from, farmer_contact, leaf_quantity_kg, leaf_grade, farmer_location, employee_id)
             VALUES (:collection_date, :bought_from, :farmer_contact, :leaf_quantity_kg, :leaf_grade, :farmer_location, :employee_id)'
        );

        $stmt->execute([
            'collection_date' => $payload['collection_date'],
            'bought_from' => trim((string)$payload['bought_from']),
            'farmer_contact' => $payload['farmer_contact'] !== '' ? trim((string)$payload['farmer_contact']) : null,
            'leaf_quantity_kg' => $qty,
            'leaf_grade' => $payload['leaf_grade'],
            'farmer_location' => $payload['farmer_location'] !== '' ? trim((string)$payload['farmer_location']) : null,
            'employee_id' => $user['id'] ?? null
        ]);

        $farmerId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM leaf_collections WHERE farmer_id = :farmer_id LIMIT 1');
        $stmt->execute(['farmer_id' => $farmerId]);
        $created = $stmt->fetch();

        json_response(['leaf_collection' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Leaf Collections API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


