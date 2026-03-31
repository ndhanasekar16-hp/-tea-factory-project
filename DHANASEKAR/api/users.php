<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/AuthService.php';

try {
    ensure_role(['admin']);

    $method = $_SERVER['REQUEST_METHOD'];
    $repo = new UserRepository();
    $auth = new AuthService();

    if ($method === 'GET') {
        json_response(['users' => $repo->all()]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['full_name', 'email', 'password', 'role'];

        foreach ($required as $field) {
            if (empty($payload[$field])) {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        $user = $auth->register($payload);

        json_response(['user' => $user], 201);
    }

    if ($method === 'PATCH') {
        $payload = get_json_body();
        $userId = (int)($payload['id'] ?? 0);
        $role = $payload['role'] ?? '';

        if ($userId <= 0 || $role === '') {
            json_response(['error' => 'User id and role are required'], 422);
        }

        $updated = $repo->updateRole($userId, $role);
        json_response(['user' => [
            'id' => $updated['id'],
            'full_name' => $updated['full_name'],
            'email' => $updated['email'],
            'role' => $updated['role'],
            'phone' => $updated['phone'],
        ]]);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Users API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}


