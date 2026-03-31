<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $employeeId = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if ($employeeId) {
            // Get single employee by ID
            $stmt = db()->prepare('SELECT * FROM employees WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $employeeId]);
            $employee = $stmt->fetch();
            
            if (!$employee) {
                json_response(['error' => 'Employee not found'], 404);
            }
            
            json_response(['employee' => $employee]);
        } else {
            // Get all employees
            $stmt = db()->query('SELECT * FROM employees ORDER BY created_at DESC');
            $employees = $stmt->fetchAll();
            json_response(['employees' => $employees]);
        }
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['full_name', 'email', 'position', 'hire_date'];

        foreach ($required as $field) {
            if (empty($payload[$field])) {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Check if email already exists
        $stmt = db()->prepare('SELECT id FROM employees WHERE email = :email LIMIT 1');
        $stmt->execute(['email' => $payload['email']]);
        if ($stmt->fetch()) {
            json_response(['error' => 'Email already in use'], 409);
        }

        $stmt = db()->prepare(
            'INSERT INTO employees (full_name, email, phone, position, department, hire_date, salary, status) 
             VALUES (:full_name, :email, :phone, :position, :department, :hire_date, :salary, :status)'
        );

        $stmt->execute([
            'full_name' => trim($payload['full_name']),
            'email' => trim($payload['email']),
            'phone' => trim($payload['phone'] ?? ''),
            'position' => trim($payload['position']),
            'department' => trim($payload['department'] ?? ''),
            'hire_date' => $payload['hire_date'],
            'salary' => $payload['salary'] ?? null,
            'status' => $payload['status'] ?? 'active',
        ]);

        $employeeId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM employees WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $employeeId]);
        $employee = $stmt->fetch();

        json_response(['employee' => $employee], 201);
    }

    if ($method === 'PUT') {
        $payload = get_json_body();
        $employeeId = (int)($payload['id'] ?? 0);

        if ($employeeId <= 0) {
            json_response(['error' => 'Employee id is required'], 422);
        }

        $stmt = db()->prepare(
            'UPDATE employees 
             SET full_name = :full_name, email = :email, phone = :phone, position = :position, 
                 department = :department, hire_date = :hire_date, salary = :salary, status = :status
             WHERE id = :id'
        );

        $stmt->execute([
            'full_name' => trim($payload['full_name']),
            'email' => trim($payload['email']),
            'phone' => trim($payload['phone'] ?? ''),
            'position' => trim($payload['position']),
            'department' => trim($payload['department'] ?? ''),
            'hire_date' => $payload['hire_date'],
            'salary' => $payload['salary'] ?? null,
            'status' => $payload['status'] ?? 'active',
            'id' => $employeeId,
        ]);

        $stmt = db()->prepare('SELECT * FROM employees WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $employeeId]);
        $employee = $stmt->fetch();

        json_response(['employee' => $employee]);
    }

    if ($method === 'DELETE') {
        $payload = get_json_body();
        $employeeId = (int)($payload['id'] ?? 0);

        if ($employeeId <= 0) {
            json_response(['error' => 'Employee id is required'], 422);
        }

        $stmt = db()->prepare('DELETE FROM employees WHERE id = :id');
        $stmt->execute(['id' => $employeeId]);

        json_response(['message' => 'Employee deleted successfully']);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Employees API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

