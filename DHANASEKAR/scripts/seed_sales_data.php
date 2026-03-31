<?php
/**
 * Seed Sample Data for Sales Module
 * This script adds sample customers and ensures inventory data exists
 */

declare(strict_types=1);
require_once __DIR__ . '/../config.php';

try {
    echo "Starting to seed sales module data...\n\n";

    // Seed sample customers
    echo "Seeding sample customers...\n";
    
    $customers = [
        [
            'customer_name' => 'ABC Trading Company',
            'customer_type' => 'Wholesale',
            'phone' => '+91-9876543210',
            'email' => 'abc@trading.com',
            'address' => '123 Market Street',
            'city' => 'Bangalore',
            'state' => 'Karnataka',
            'pincode' => '560001',
            'gst_number' => '29AAACT1234A1Z0',
            'credit_limit' => 50000
        ],
        [
            'customer_name' => 'Green Leaf Distributors',
            'customer_type' => 'Distributor',
            'phone' => '+91-9876543211',
            'email' => 'greenleaf@dist.com',
            'address' => '456 Trade Lane',
            'city' => 'Chennai',
            'state' => 'Tamil Nadu',
            'pincode' => '600001',
            'gst_number' => '33AAACT5678B1Z5',
            'credit_limit' => 75000
        ],
        [
            'customer_name' => 'Local Tea Shop',
            'customer_type' => 'Retail',
            'phone' => '+91-9876543212',
            'email' => 'teashop@local.com',
            'address' => '789 Main Road',
            'city' => 'Mumbai',
            'state' => 'Maharashtra',
            'pincode' => '400001',
            'gst_number' => '27AAACT9012C1Z3',
            'credit_limit' => 25000
        ],
        [
            'customer_name' => 'Premium Estates Ltd',
            'customer_type' => 'Wholesale',
            'phone' => '+91-9876543213',
            'email' => 'premium@estates.com',
            'address' => '321 Corporate Park',
            'city' => 'Delhi',
            'state' => 'Delhi',
            'pincode' => '110001',
            'gst_number' => '07AAACT3456D1Z7',
            'credit_limit' => 100000
        ],
        [
            'customer_name' => 'Wellness Coffee House',
            'customer_type' => 'Retail',
            'phone' => '+91-9876543214',
            'email' => 'wellness@coffee.com',
            'address' => '654 Wellness Avenue',
            'city' => 'Pune',
            'state' => 'Maharashtra',
            'pincode' => '411001',
            'gst_number' => null,
            'credit_limit' => 20000
        ]
    ];

    foreach ($customers as $customer) {
        // Check if customer already exists
        $checkStmt = db()->prepare(
            'SELECT customer_id FROM customers WHERE gst_number = :gst OR (customer_name = :name AND customer_type = :type) LIMIT 1'
        );
        $checkStmt->execute([
            'gst' => $customer['gst_number'],
            'name' => $customer['customer_name'],
            'type' => $customer['customer_type']
        ]);

        if (!$checkStmt->fetch()) {
            $stmt = db()->prepare(
                'INSERT INTO customers (customer_name, customer_type, email, phone, address, city, state, pincode, gst_number, credit_limit, status)
                 VALUES (:name, :type, :email, :phone, :address, :city, :state, :pincode, :gst, :credit, :status)'
            );
            
            $stmt->execute([
                'name' => $customer['customer_name'],
                'type' => $customer['customer_type'],
                'email' => $customer['email'],
                'phone' => $customer['phone'],
                'address' => $customer['address'],
                'city' => $customer['city'],
                'state' => $customer['state'],
                'pincode' => $customer['pincode'],
                'gst' => $customer['gst_number'],
                'credit' => $customer['credit_limit'],
                'status' => 'active'
            ]);
            
            echo "✓ Added customer: {$customer['customer_name']}\n";
        } else {
            echo "✓ Customer {$customer['customer_name']} already exists\n";
        }
    }

    echo "\n✓ All sample customers seeded successfully!\n";
    echo "\nNote: Sample products are already seeded in the inventory table.\n";
    echo "You can now use the Sales Management module to create sales.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
