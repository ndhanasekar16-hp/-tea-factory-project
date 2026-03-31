<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

try {
    ensure_authenticated();

    $roles = ['admin', 'manager', 'user'];

    json_response(['roles' => $roles]);
} catch (Exception $e) {
    error_log('Roles API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


