<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $sql = 'SELECT * FROM payroll WHERE 1=1';
        $params = [];

        // Filter by payment type if provided
        if (isset($_GET['payment_type']) && !empty($_GET['payment_type'])) {
            $sql .= ' AND payment_type = :payment_type';
            $params['payment_type'] = $_GET['payment_type'];
        }

        // Filter by payment status if provided
        if (isset($_GET['payment_status']) && !empty($_GET['payment_status'])) {
            $sql .= ' AND payment_status = :payment_status';
            $params['payment_status'] = $_GET['payment_status'];
        }

        $sql .= ' ORDER BY created_at DESC';
        
        $stmt = db()->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        json_response(['payroll' => $rows]);
    }

    if ($method === 'POST') {
        $payload = get_json_body();
        
        // Basic Validation
        $required = [
            'payment_date',
            'amount',
            'payment_type',
            'payment_category',
            'payment_mode',
            'payment_status'
        ];

        foreach ($required as $field) {
            if (empty($payload[$field]) && $payload[$field] !== 0 && $payload[$field] !== '0') {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }
        
        // Helper to get value or null
        $get = fn($key) => isset($payload[$key]) && $payload[$key] !== '' ? $payload[$key] : null;

        $stmt = db()->prepare(
            'INSERT INTO payroll (
                payment_date, payee_name, amount, transaction_id, payment_type, 
                payment_category, department, payment_mode, payment_status,
                
                employee_id, employee_name, designation, total_days_working, 
                attendance_days, salary_amount, salary_type, working_time, working_shift,
                
                supplier_id, supplier_name, tax_gst, supplier_total_amount, 
                quantity_kg, invoice_no, supply_date, supplier_specific_type,
                
                transport_id, vehicle_no, driver_name, distance, driver_salary, 
                toll_charges, loading_charges, fuel_cost, total_transport_cost, 
                trip_date, transport_type
            ) VALUES (
                :payment_date, :payee_name, :amount, :transaction_id, :payment_type, 
                :payment_category, :department, :payment_mode, :payment_status,
                
                :employee_id, :employee_name, :designation, :total_days_working, 
                :attendance_days, :salary_amount, :salary_type, :working_time, :working_shift,
                
                :supplier_id, :supplier_name, :tax_gst, :supplier_total_amount, 
                :quantity_kg, :invoice_no, :supply_date, :supplier_specific_type,
                
                :transport_id, :vehicle_no, :driver_name, :distance, :driver_salary, 
                :toll_charges, :loading_charges, :fuel_cost, :total_transport_cost, 
                :trip_date, :transport_type
            )'
        );

        $stmt->execute([
            'payment_date' => $payload['payment_date'],
            'payee_name' => $get('payee_name'),
            'amount' => $payload['amount'],
            'transaction_id' => $get('transaction_id'),
            'payment_type' => $payload['payment_type'],
            'payment_category' => $payload['payment_category'],
            'department' => $get('department'),
            'payment_mode' => $payload['payment_mode'],
            'payment_status' => $payload['payment_status'],
            
            'employee_id' => $get('employee_id'),
            'employee_name' => $get('employee_name'),
            'designation' => $get('designation'),
            'total_days_working' => $get('total_days_working'),
            'attendance_days' => $get('attendance_days'),
            'salary_amount' => $get('salary_amount'),
            'salary_type' => $get('salary_type'),
            'working_time' => $get('working_time'),
            'working_shift' => $get('working_shift'),
            
            'supplier_id' => $get('supplier_id'),
            'supplier_name' => $get('supplier_name'),
            'tax_gst' => $get('tax_gst'),
            'supplier_total_amount' => $get('supplier_total_amount'),
            'quantity_kg' => $get('quantity_kg'),
            'invoice_no' => $get('invoice_no'),
            'supply_date' => $get('supply_date'),
            'supplier_specific_type' => $get('supplier_specific_type'),
            
            'transport_id' => $get('transport_id'),
            'vehicle_no' => $get('vehicle_no'),
            'driver_name' => $get('driver_name'),
            'distance' => $get('distance'),
            'driver_salary' => $get('driver_salary'),
            'toll_charges' => $get('toll_charges'),
            'loading_charges' => $get('loading_charges'),
            'fuel_cost' => $get('fuel_cost'),
            'total_transport_cost' => $get('total_transport_cost'),
            'trip_date' => $get('trip_date'),
            'transport_type' => $get('transport_type'),
        ]);

        $id = (int)db()->lastInsertId();
        $stmt = db()->prepare('SELECT * FROM payroll WHERE payroll_id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $created = $stmt->fetch();

        json_response(['payroll' => $created], 201);
    }

    json_response(['error' => 'Method not allowed'], 405);
} catch (Exception $e) {
    error_log('Payroll API Error: ' . $e->getMessage());
    json_response(['error' => 'Internal server error: ' . $e->getMessage()], 500);
}
