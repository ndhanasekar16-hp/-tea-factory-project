<?php
// Quick database verification script
require_once __DIR__ . '/config.php';

try {
    // Check if sales table exists
    $stmt = db()->query("SHOW TABLES LIKE 'sales'");
    $salesTable = $stmt->fetch();
    
    if ($salesTable) {
        echo "✓ Sales table exists\n";
        
        // Check sales table structure
        $stmt = db()->query("DESCRIBE sales");
        $columns = $stmt->fetchAll();
        echo "  Columns: " . count($columns) . "\n";
        foreach ($columns as $col) {
            echo "    - " . $col['Field'] . " (" . $col['Type'] . ")\n";
        }
    } else {
        echo "✗ Sales table not found\n";
        echo "  Please run: mysql -u root tea_factory < database_schema.sql\n";
    }
    
    echo "\n";
    
    // Check customers table
    $stmt = db()->query("SHOW TABLES LIKE 'customers'");
    $customersTable = $stmt->fetch();
    
    if ($customersTable) {
        echo "✓ Customers table exists\n";
        $stmt = db()->query("SELECT COUNT(*) as count FROM customers");
        $result = $stmt->fetch();
        echo "  Records: " . $result['count'] . "\n";
    } else {
        echo "✗ Customers table not found\n";
    }
    
    echo "\n";
    
    // Check other tables
    $tables = ['sales_items', 'payments', 'sales_analytics'];
    foreach ($tables as $table) {
        $stmt = db()->query("SHOW TABLES LIKE '$table'");
        $exists = $stmt->fetch();
        echo ($exists ? "✓" : "✗") . " " . ucwords(str_replace('_', ' ', $table)) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Connection Status: Failed\n";
    exit(1);
}
?>
