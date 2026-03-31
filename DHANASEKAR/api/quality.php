<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $qualityStatus = $_GET['quality_status'] ?? null;

        $sql = 'SELECT * FROM quality WHERE 1=1';
        $params = [];

        if (!empty($qualityStatus)) {
            $sql .= ' AND quality_status = :quality_status';
            $params['quality_status'] = $qualityStatus;
        }

        $sql .= ' ORDER BY created_at DESC, quality_id DESC';

        if ($params) {
            $stmt = db()->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = db()->query($sql);
        }

        $rows = $stmt->fetchAll();
        json_response(['quality' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = [
            'batch_no',
            'production_date',
            'checked_by',
            'quality_standard_no',
            'moisture_in_percentage',
            'quality_status',
            'color_',
            'aroma',
            'taste'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Validate quality_status
        $validStatuses = ['approved', 'hold', 'Reprocess', 'rejected'];
        if (!in_array($payload['quality_status'], $validStatuses, true)) {
            json_response(['error' => 'quality_status is invalid'], 422);
        }

        // Validate color_
        $validColors = ['bright', 'dull', 'dark', 'light'];
        if (!in_array($payload['color_'], $validColors, true)) {
            json_response(['error' => 'color_ is invalid'], 422);
        }

        // Validate aroma
        $validAromas = ['strong', 'medium', 'weak'];
        if (!in_array($payload['aroma'], $validAromas, true)) {
            json_response(['error' => 'aroma is invalid'], 422);
        }

        // Validate taste
        $validTastes = ['excellent', 'good', 'average'];
        if (!in_array($payload['taste'], $validTastes, true)) {
            json_response(['error' => 'taste is invalid'], 422);
        }

        $stmt = db()->prepare(
            'INSERT INTO quality (
                batch_no, production_date, expiry_date, checked_by, quality_standard_no,
                moisture_in_percentage, quality_status, color_, aroma, taste
            ) VALUES (
                :batch_no, :production_date, :expiry_date, :checked_by, :quality_standard_no,
                :moisture_in_percentage, :quality_status, :color_, :aroma, :taste
            )'
        );

        $stmt->execute([
            'batch_no' => trim((string)$payload['batch_no']),
            'production_date' => $payload['production_date'],
            'expiry_date' => $payload['expiry_date'] ?? null,
            'checked_by' => trim((string)$payload['checked_by']),
            'quality_standard_no' => trim((string)$payload['quality_standard_no']),
            'moisture_in_percentage' => trim((string)$payload['moisture_in_percentage']),
            'quality_status' => $payload['quality_status'],
            'color_' => $payload['color_'],
            'aroma' => $payload['aroma'],
            'taste' => $payload['taste'],
        ]);

        $qualityId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM quality WHERE quality_id = :quality_id LIMIT 1');
        $stmt->execute(['quality_id' => $qualityId]);
        $created = $stmt->fetch();

        json_response(['quality' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Quality API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

