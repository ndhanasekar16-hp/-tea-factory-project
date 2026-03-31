<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $customerId = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if ($customerId) {
            // Get single customer
            $stmt = db()->prepare('SELECT * FROM customers WHERE customer_id = :id LIMIT 1');
            $stmt->execute(['id' => $customerId]);
            $customer = $stmt->fetch();
            
            if (!$customer) {
                json_response(['error' => 'Customer not found'], 404);
            }
            
            json_response(['customer' => $customer]);
        } else {
            // Get all customers with optional type filter
            $type = $_GET['type'] ?? null;
            
            if ($type) {
                $stmt = db()->prepare('SELECT * FROM customers WHERE customer_type = :type ORDER BY customer_name');
                $stmt->execute(['type' => $type]);
            } else {
                $stmt = db()->query('SELECT * FROM customers ORDER BY customer_name');
            }
            
            $customers = $stmt->fetchAll();
            json_response(['customers' => $customers]);
        }
    }
    
    if ($method === 'POST') {
        $payload = get_json_body();
        $required = ['customer_name', 'customer_type', 'phone'];
        
        foreach ($required as $field) {
            if (empty($payload[$field])) {
                json_response(['error' => sprintf('%s is required', $field)], 422);
            }
        }
        
        // Check if customer already exists (by name and type)
        $checkStmt = db()->prepare(
            'SELECT customer_id FROM customers WHERE customer_name = :name AND customer_type = :type LIMIT 1'
        );
        $checkStmt->execute([
            'name' => $payload['customer_name'],
            'type' => $payload['customer_type']
        ]);
        
        if ($checkStmt->fetch()) {
            json_response(['error' => 'Customer already exists'], 409);
        }
        
        // Check if GST number already exists
        if (!empty($payload['gst_number'])) {
            $gstCheckStmt = db()->prepare('SELECT customer_id FROM customers WHERE gst_number = :gst LIMIT 1');
            $gstCheckStmt->execute(['gst' => $payload['gst_number']]);
            if ($gstCheckStmt->fetch()) {
                json_response(['error' => 'GST number already registered'], 409);
            }
        }
        
        $stmt = db()->prepare(
            'INSERT INTO customers (customer_name, customer_type, email, phone, address, city, state, pincode, gst_number, credit_limit, status)
             VALUES (:name, :type, :email, :phone, :address, :city, :state, :pincode, :gst, :credit, :status)'
        );
        
        $stmt->execute([
            'name' => trim($payload['customer_name']),
            'type' => $payload['customer_type'],
            'email' => trim($payload['email'] ?? ''),
            'phone' => trim($payload['phone']),
            'address' => trim($payload['address'] ?? ''),
            'city' => trim($payload['city'] ?? ''),
            'state' => trim($payload['state'] ?? ''),
            'pincode' => trim($payload['pincode'] ?? ''),
            'gst' => trim($payload['gst_number'] ?? ''),
            'credit' => (float)($payload['credit_limit'] ?? 0),
            'status' => 'active'
        ]);
        
        $customerId = (int)db()->lastInsertId();
        
        $fetchStmt = db()->prepare('SELECT * FROM customers WHERE customer_id = :id LIMIT 1');
        $fetchStmt->execute(['id' => $customerId]);
        $customer = $fetchStmt->fetch();
        
        json_response(['customer' => $customer], 201);
    }
    
    if ($method === 'PUT') {
        $payload = get_json_body();
        $customerId = (int)($payload['id'] ?? 0);
        
        if ($customerId <= 0) {
            json_response(['error' => 'Customer id is required'], 422);
        }
        
        // Check if customer exists
        $checkStmt = db()->prepare('SELECT * FROM customers WHERE customer_id = :id LIMIT 1');
        $checkStmt->execute(['id' => $customerId]);
        if (!$checkStmt->fetch()) {
            json_response(['error' => 'Customer not found'], 404);
        }
        
        $updateFields = [];
        $updateValues = ['id' => $customerId];
        
        if (isset($payload['customer_name'])) {
            $updateFields[] = 'customer_name = :name';
            $updateValues['name'] = $payload['customer_name'];
        }
        if (isset($payload['email'])) {
            $updateFields[] = 'email = :email';
            $updateValues['email'] = $payload['email'];
        }
        if (isset($payload['phone'])) {
            $updateFields[] = 'phone = :phone';
            $updateValues['phone'] = $payload['phone'];
        }
        if (isset($payload['address'])) {
            $updateFields[] = 'address = :address';
            $updateValues['address'] = $payload['address'];
        }
        if (isset($payload['status'])) {
            $updateFields[] = 'status = :status';
            $updateValues['status'] = $payload['status'];
        }
        if (isset($payload['credit_limit'])) {
            $updateFields[] = 'credit_limit = :credit';
            $updateValues['credit'] = $payload['credit_limit'];
        }
        
        if (empty($updateFields)) {
            json_response(['error' => 'No fields to update'], 422);
        }
        
        $sql = 'UPDATE customers SET ' . implode(', ', $updateFields) . ' WHERE customer_id = :id';
        $stmt = db()->prepare($sql);
        $stmt->execute($updateValues);
        
        $fetchStmt = db()->prepare('SELECT * FROM customers WHERE customer_id = :id LIMIT 1');
        $fetchStmt->execute(['id' => $customerId]);
        $customer = $fetchStmt->fetch();
        
        json_response(['customer' => $customer]);
    }
    
} catch (Exception $e) {
    json_response(['error' => 'Server error: ' . $e->getMessage()], 500);
}
