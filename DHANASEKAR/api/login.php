<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/AuthService.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        json_response(['error' => 'Method not allowed'], 405);
    }

    $payload = get_json_body();
    $email = trim($payload['email'] ?? '');
    $password = $payload['password'] ?? '';

    if ($email === '' || $password === '') {
        json_response(['error' => 'Email and password are required'], 422);
    }

    $auth = new AuthService();
    $result = $auth->login($email, $password);

    json_response($result);
} catch (Exception $e) {
    error_log('Login API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


