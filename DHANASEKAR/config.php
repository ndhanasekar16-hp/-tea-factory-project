<?php
declare(strict_types=1);

/**
 * Global bootstrap for database access, sessions, and shared helpers.
 */

session_start();

const DB_HOST = '127.0.0.1';
const DB_NAME = 'tea_factory';
const DB_USER = 'root';
const DB_PASSWORD = '';

/**
 * Lazily instantiate a single PDO connection.
 */
function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_NAME);
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASSWORD, $options);
    }

    return $pdo;
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function get_json_body(): array
{
    $body = file_get_contents('php://input');
    $decoded = json_decode($body ?? '', true);

    return is_array($decoded) ? $decoded : [];
}

function ensure_authenticated(): array
{
    // Check for token in Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $decoded = base64_decode($token);
        $parts = explode(':', $decoded);
        
        if (count($parts) >= 2) {
            $userId = (int)$parts[0];
            $email = $parts[1];
            
            // Verify token and get user
            $stmt = db()->prepare('SELECT id, full_name, email, role, phone FROM employees WHERE id = :id AND email = :email LIMIT 1');
            $stmt->execute(['id' => $userId, 'email' => $email]);
            $user = $stmt->fetch();
            
            if ($user) {
                return [
                    'id' => $user['id'],
                    'full_name' => $user['full_name'],
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'phone' => $user['phone'] ?? null,
                ];
            }
        }
    }
    
    // Fallback to session
    if (isset($_SESSION['user'])) {
        return $_SESSION['user'];
    }
    
    json_response(['error' => 'Unauthenticated'], 401);
}

function ensure_role(array $roles): array
{
    $user = ensure_authenticated();

    if (!in_array($user['role'], $roles, true)) {
        json_response(['error' => 'Forbidden'], 403);
    }

    return $user;
}

function set_session_user(array $user): void
{
    $_SESSION['user'] = [
        'id' => $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
        'phone' => $user['phone'] ?? null,
    ];
}



