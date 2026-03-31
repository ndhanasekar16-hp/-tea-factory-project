#!/bin/bash
# Sales Module Database Initialization Script
# This script initializes the database with all necessary tables for the Sales Module

echo "=========================================="
echo "Sales Module Database Initialization"
echo "=========================================="
echo ""

DB_USER="root"
DB_PASSWORD=""
DB_NAME="tea_factory"
DB_HOST="127.0.0.1"

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Check if MySQL is available
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found in PATH"
    echo "Please ensure MySQL is installed and in your PATH"
    exit 1
fi

echo "Attempting to connect to database..."

# Test connection
mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null

if [ $? -ne 0 ]; then
    echo "❌ Database connection failed"
    echo "Please check your MySQL configuration"
    exit 1
fi

echo "✅ Database connection successful"
echo ""

echo "Creating sales module tables..."

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'

-- Drop existing tables if they exist (for fresh install)
-- Comment these out if you want to preserve existing data
-- DROP TABLE IF EXISTS sales_analytics;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS sales_items;
-- DROP TABLE IF EXISTS sales;
-- DROP TABLE IF EXISTS customers;

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    customer_type ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    pincode VARCHAR(10) NULL,
    gst_number VARCHAR(50) NULL UNIQUE,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_type (customer_type),
    INDEX idx_customer_status (status),
    INDEX idx_gst_number (gst_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales (
    sale_id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    sale_date DATE NOT NULL,
    sale_time TIME NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    cgst_amount DECIMAL(12, 2) DEFAULT 0,
    sgst_amount DECIMAL(12, 2) DEFAULT 0,
    igst_amount DECIMAL(12, 2) DEFAULT 0,
    total_tax DECIMAL(12, 2) DEFAULT 0,
    grand_total DECIMAL(12, 2) NOT NULL,
    total_profit DECIMAL(12, 2) DEFAULT 0,
    payment_mode ENUM('Cash', 'UPI', 'Card', 'Bank Transfer', 'Credit') DEFAULT 'Cash',
    payment_status VARCHAR(20) DEFAULT 'pending',
    created_by INT NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_sale_date (sale_date),
    INDEX idx_customer_id (customer_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_sales_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALES ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    inventory_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    quantity_sold DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    line_discount_amount DECIMAL(12, 2) DEFAULT 0,
    line_discount_percentage DECIMAL(5, 2) DEFAULT 0,
    line_subtotal DECIMAL(12, 2) NOT NULL,
    line_profit DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE RESTRICT,
    INDEX idx_sale_id (sale_id),
    INDEX idx_inventory_id (inventory_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_time TIME NULL,
    payment_mode ENUM('Cash', 'UPI', 'Card', 'Bank Transfer') NOT NULL,
    transaction_id VARCHAR(100) NULL,
    payment_status VARCHAR(20) DEFAULT 'completed',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
    INDEX idx_sale_payment (sale_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_status_idx (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SALES ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sales_analytics (
    analytics_id INT PRIMARY KEY AUTO_INCREMENT,
    analytics_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    total_sales_count INT DEFAULT 0,
    total_sales_amount DECIMAL(15, 2) DEFAULT 0,
    total_profit DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    avg_order_value DECIMAL(12, 2) DEFAULT 0,
    customer_count INT DEFAULT 0,
    items_sold INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_analytics (analytics_date, period_type),
    INDEX idx_analytics_date (analytics_date),
    INDEX idx_period_type (period_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

EOF

if [ $? -eq 0 ]; then
    echo "✅ Tables created successfully"
else
    echo "❌ Error creating tables"
    exit 1
fi

echo ""
echo "Seeding sample data..."

mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << 'EOF'

-- Insert sample customers
INSERT IGNORE INTO customers (customer_name, customer_type, email, phone, address, city, state, pincode, gst_number, credit_limit, status)
VALUES
    ('Fresh Mart Retail', 'Retail', 'freshmart@example.com', '+919876543210', '123 Main Street', 'Bangalore', 'Karnataka', '560001', '29AAAAA0000A1Z5', 50000.00, 'active'),
    ('Green Valley Wholesale', 'Wholesale', 'greenvalley@example.com', '+919876543211', '456 Business Park', 'Ooty', 'Tamil Nadu', '643001', '33BBBBB0000B2Z5', 150000.00, 'active'),
    ('Quick Distribution Ltd', 'Distributor', 'quickdist@example.com', '+919876543212', '789 Logistics Hub', 'Erode', 'Tamil Nadu', '638001', '33CCCCC0000C3Z5', 250000.00, 'active'),
    ('Premium Tea Store', 'Retail', 'premiumtea@example.com', '+919876543213', '321 Shopping Mall', 'Coimbatore', 'Tamil Nadu', '641001', '33DDDDD0000D4Z5', 75000.00, 'active');

EOF

if [ $? -eq 0 ]; then
    echo "✅ Sample data inserted successfully"
else
    echo "⚠️ Warning: Some sample data may not have been inserted (could be duplicates)"
fi

echo ""
echo "=========================================="
echo "✅ Sales Module Initialization Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Login to the system"
echo "2. Click 'Sales' in Quick Actions"
echo "3. Or navigate to /FE/sales.html"
echo ""
echo "Documentation:"
echo "- Quick Start: SALES_QUICK_START.md"
echo "- Full Docs: SALES_MODULE.md"
echo "- API Docs: SALES_API_DOCUMENTATION.md"
echo ""
