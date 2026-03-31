<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['error' => 'Method not allowed'], 405);
    }

    session_unset();
    session_destroy();

    json_response(['message' => 'Logged out']);
} catch (Exception $e) {
    error_log('Logout API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


