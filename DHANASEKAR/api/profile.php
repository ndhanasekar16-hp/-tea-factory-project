<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/AuthService.php';

try {
    $auth = new AuthService();
    $user = ensure_authenticated();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        json_response(['user' => $user]);
    }

    if ($method === 'PUT') {
        $payload = get_json_body();

        $fullName = trim($payload['full_name'] ?? '');
        if ($fullName === '') {
            json_response(['error' => 'Full name is required'], 422);
        }

        $data = [
            'full_name' => $fullName,
            'phone' => trim($payload['phone'] ?? ''),
        ];

        $updated = $auth->updateProfile((int)$user['id'], $data);

        json_response(['user' => $updated]);
    }

    if ($method === 'PATCH') {
        $payload = get_json_body();
        $current = $payload['current_password'] ?? '';
        $new = $payload['new_password'] ?? '';

        if ($current === '' || $new === '') {
            json_response(['error' => 'Missing password fields'], 422);
        }

        $auth->updatePassword((int)$user['id'], $current, $new);

        json_response(['message' => 'Password updated']);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Profile API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


