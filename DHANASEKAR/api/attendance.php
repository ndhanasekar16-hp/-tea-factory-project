<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $employeeId = isset($_GET['employee_id']) ? (int)$_GET['employee_id'] : null;
        $date = $_GET['date'] ?? null;

        if ($employeeId) {
            if ($date) {
                $stmt = db()->prepare(
                    'SELECT * FROM attendance WHERE employee_id = :employee_id AND attendance_date = :date LIMIT 1'
                );
                $stmt->execute(['employee_id' => $employeeId, 'date' => $date]);
                $attendance = $stmt->fetch();
                json_response(['attendance' => $attendance]);
            } else {
                $stmt = db()->prepare(
                    'SELECT * FROM attendance WHERE employee_id = :employee_id ORDER BY attendance_date DESC'
                );
                $stmt->execute(['employee_id' => $employeeId]);
                $attendance = $stmt->fetchAll();
                json_response(['attendance' => $attendance]);
            }
        } else {
            $stmt = db()->query('SELECT * FROM attendance ORDER BY attendance_date DESC, employee_id');
            $attendance = $stmt->fetchAll();
            json_response(['attendance' => $attendance]);
        }
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['employee_id', 'attendance_date'];

        foreach ($required as $field) {
            if (empty($payload[$field])) {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }

        // Check if attendance already exists for this date
        $stmt = db()->prepare(
            'SELECT id FROM attendance WHERE employee_id = :employee_id AND attendance_date = :date LIMIT 1'
        );
        $stmt->execute([
            'employee_id' => (int)$payload['employee_id'],
            'date' => $payload['attendance_date']
        ]);
        
        if ($stmt->fetch()) {
            json_response(['error' => 'Attendance already recorded for this date'], 409);
        }

        $stmt = db()->prepare(
            'INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, notes) 
             VALUES (:employee_id, :attendance_date, :check_in_time, :check_out_time, :status, :notes)'
        );

        $stmt->execute([
            'employee_id' => (int)$payload['employee_id'],
            'attendance_date' => $payload['attendance_date'],
            'check_in_time' => $payload['check_in_time'] ?? null,
            'check_out_time' => $payload['check_out_time'] ?? null,
            'status' => $payload['status'] ?? 'present',
            'notes' => trim($payload['notes'] ?? ''),
        ]);

        $attendanceId = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM attendance WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $attendanceId]);
        $attendance = $stmt->fetch();

        json_response(['attendance' => $attendance], 201);
    }

    if ($method === 'PATCH') {
        $payload = get_json_body();
        $attendanceId = (int)($payload['id'] ?? 0);

        if ($attendanceId <= 0) {
            json_response(['error' => 'Attendance id is required'], 422);
        }

        $stmt = db()->prepare(
            'UPDATE attendance 
             SET check_in_time = :check_in_time, check_out_time = :check_out_time, status = :status, notes = :notes
             WHERE id = :id'
        );

        $stmt->execute([
            'check_in_time' => $payload['check_in_time'] ?? null,
            'check_out_time' => $payload['check_out_time'] ?? null,
            'status' => $payload['status'] ?? 'present',
            'notes' => trim($payload['notes'] ?? ''),
            'id' => $attendanceId,
        ]);

        $stmt = db()->prepare('SELECT * FROM attendance WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $attendanceId]);
        $attendance = $stmt->fetch();

        json_response(['attendance' => $attendance]);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Attendance API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error'], 500);
}

