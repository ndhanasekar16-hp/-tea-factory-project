<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

try {
    ensure_authenticated();
    json_response(['user' => $_SESSION['user']]);
} catch (Exception $e) {
    error_log('Session API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


