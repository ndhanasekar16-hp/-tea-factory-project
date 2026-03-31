<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $category = $_GET['category'] ?? null;
        
        $sql = 'SELECT * FROM settings';
        $params = [];
        
        if ($category) {
            $sql .= ' WHERE category = :category';
            $params['category'] = $category;
        }
        
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        
        // Transform to key-value structure for easier FE consumption if needed, 
        // but returning rows is more standard for a "list" API.
        // Let's return rows, FE can map.
        
        json_response(['settings' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        
        // Support both single update and bulk update (array of settings)
        // If payload is a list, iterate. If object, wrap in list.
        $items = isset($payload[0]) ? $payload : [$payload];
        
        $results = [];
        
        foreach ($items as $item) {
            // Validate
            if (empty($item['category']) || empty($item['setting_key'])) {
                continue; // Skip invalid
            }
            
            $value = is_array($item['setting_value']) || is_object($item['setting_value']) 
                ? json_encode($item['setting_value']) 
                : $item['setting_value'];

            $sql = 'INSERT INTO settings (category, setting_key, setting_value, description) 
                    VALUES (:category, :key, :value, :desc)
                    ON DUPLICATE KEY UPDATE 
                    setting_value = VALUES(setting_value),
                    description = VALUES(description)';
            
            $stmt = db()->prepare($sql);
            $stmt->execute([
                'category' => $item['category'],
                'key' => $item['setting_key'],
                'value' => $value,
                'desc' => $item['description'] ?? null
            ]);
            
            $results[] = [
                'category' => $item['category'],
                'key' => $item['setting_key'],
                'status' => 'saved'
            ];
        }

        json_response(['message' => 'Settings saved successfully', 'updates' => $results]);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Settings API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}
