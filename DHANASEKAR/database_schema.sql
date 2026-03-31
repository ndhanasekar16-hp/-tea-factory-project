-- Database: tea_factory

-- Users table (already exists, but including for reference)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'employee123',
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    phone VARCHAR(50) NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2) NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    status VARCHAR(20) DEFAULT 'present',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, attendance_date)
);

-- Indexes for better performance
CREATE INDEX idx_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_employee_status ON employees(status);

-- ============================================
-- SEED DATA - Initial Data for Testing
-- ============================================

-- Insert default admin user (password: "admin123")
-- You can change the password after first login
INSERT INTO users (full_name, email, password_hash, role, phone) 
VALUES 
    ('System Administrator', 'admin@teafactory.com', 'admin123', 'admin', '+1234567890'),
    ('Manager User', 'manager@teafactory.com', 'manager123', 'manager', '+1234567891'),
    ('Regular User', 'user@teafactory.com', 'user123', 'user', '+1234567892');

-- Insert sample employees
INSERT INTO employees (full_name, email, password_hash, role, phone, position, department, hire_date, salary, status) 
VALUES 
    ('System Administrator', 'admin@teafactory.com', 'admin123', 'admin', '+1234567890', 'Administrator', 'Management', '2024-01-01', 100000.00, 'active'),
    ('Manager User', 'manager@teafactory.com', 'manager123', 'manager', '+1234567891', 'Operations Manager', 'Management', '2024-01-01', 80000.00, 'active'),
    ('Regular User', 'user@teafactory.com', 'user123', 'user', '+1234567892', 'Shift Employee', 'Production', '2024-01-01', 30000.00, 'active'),
    ('John Doe', 'john.doe@teafactory.com', 'employee123', 'employee', '+1234567900', 'Production Manager', 'Production', '2024-01-01', 50000.00, 'active'),
    ('Jane Smith', 'jane.smith@teafactory.com', 'employee123', 'employee', '+1234567901', 'Quality Inspector', 'Quality Control', '2024-01-15', 35000.00, 'active'),
    ('Mike Johnson', 'mike.johnson@teafactory.com', 'employee123', 'employee', '+1234567902', 'Machine Operator', 'Production', '2024-02-01', 28000.00, 'active'),
    ('Sarah Williams', 'sarah.williams@teafactory.com', 'employee123', 'employee', '+1234567903', 'Warehouse Supervisor', 'Inventory', '2024-02-15', 32000.00, 'active'),
    ('David Brown', 'david.brown@teafactory.com', 'employee123', 'employee', '+1234567904', 'Tea Picker', 'Field Operations', '2024-03-01', 25000.00, 'active');

-- Insert sample attendance records (for the last 7 days)
-- Note: Adjust dates based on current date when running
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, notes) 
VALUES 
    -- John Doe's attendance
    (1, CURDATE() - INTERVAL 6 DAY, '08:30:00', '17:00:00', 'present', 'On time'),
    (1, CURDATE() - INTERVAL 5 DAY, '08:45:00', '17:15:00', 'present', 'Slightly late'),
    (1, CURDATE() - INTERVAL 4 DAY, '08:30:00', '17:00:00', 'present', 'On time'),
    (1, CURDATE() - INTERVAL 3 DAY, '08:30:00', '17:00:00', 'present', 'On time'),
    (1, CURDATE() - INTERVAL 2 DAY, '08:30:00', '17:00:00', 'present', 'On time'),
    (1, CURDATE() - INTERVAL 1 DAY, '08:30:00', '17:00:00', 'present', 'On time'),
    (1, CURDATE(), '08:30:00', NULL, 'present', 'Currently working'),
    
    -- Jane Smith's attendance
    (2, CURDATE() - INTERVAL 6 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE() - INTERVAL 5 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE() - INTERVAL 4 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE() - INTERVAL 3 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE() - INTERVAL 2 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE() - INTERVAL 1 DAY, '09:00:00', '18:00:00', 'present', 'On time'),
    (2, CURDATE(), '09:00:00', NULL, 'present', 'Currently working'),
    
    -- Mike Johnson's attendance
    (3, CURDATE() - INTERVAL 6 DAY, '07:00:00', '15:00:00', 'present', 'Morning shift'),
    (3, CURDATE() - INTERVAL 5 DAY, '07:00:00', '15:00:00', 'present', 'Morning shift'),
    (3, CURDATE() - INTERVAL 4 DAY, '07:00:00', '15:00:00', 'present', 'Morning shift'),
    (3, CURDATE() - INTERVAL 3 DAY, NULL, NULL, 'absent', 'Sick leave'),
    (3, CURDATE() - INTERVAL 2 DAY, '07:00:00', '15:00:00', 'present', 'Morning shift'),
    (3, CURDATE() - INTERVAL 1 DAY, '07:00:00', '15:00:00', 'present', 'Morning shift'),
    (3, CURDATE(), '07:00:00', NULL, 'present', 'Currently working'),
    
    -- Sarah Williams's attendance
    (4, CURDATE() - INTERVAL 6 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE() - INTERVAL 5 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE() - INTERVAL 4 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE() - INTERVAL 3 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE() - INTERVAL 2 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE() - INTERVAL 1 DAY, '08:00:00', '16:00:00', 'present', 'On time'),
    (4, CURDATE(), '08:00:00', NULL, 'present', 'Currently working'),
    
    -- David Brown's attendance
    (5, CURDATE() - INTERVAL 6 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE() - INTERVAL 5 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE() - INTERVAL 4 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE() - INTERVAL 3 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE() - INTERVAL 2 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE() - INTERVAL 1 DAY, '06:00:00', '14:00:00', 'present', 'Field work'),
    (5, CURDATE(), '06:00:00', NULL, 'present', 'Currently working');

-- Leaf collections table
CREATE TABLE IF NOT EXISTS leaf_collections (
    farmer_id INT PRIMARY KEY AUTO_INCREMENT,
    collection_date DATE NOT NULL,
    bought_from VARCHAR(255) NOT NULL,
    farmer_contact VARCHAR(50) NULL,
    leaf_quantity_kg DECIMAL(10, 2) NOT NULL,
    leaf_grade ENUM('A', 'B', 'C', 'D') NOT NULL,
    farmer_location VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed leaf collections
INSERT INTO leaf_collections (collection_date, bought_from, farmer_contact, leaf_quantity_kg, leaf_grade, farmer_location)
VALUES
    (CURDATE() - INTERVAL 1 DAY, 'Arun Kumar', '+94 712345678', 120.50, 'A', 'Kandy'),
    (CURDATE(), 'Muthu Farms', '+94 772223334', 85.75, 'B', 'Nuwara Eliya');

-- Productions table
CREATE TABLE IF NOT EXISTS productions (
    production_id INT PRIMARY KEY AUTO_INCREMENT,
    production_date DATE NOT NULL,
    production_cost DECIMAL(12, 2) NOT NULL,
    operator_id VARCHAR(100) NOT NULL,
    leaf_type VARCHAR(50) NOT NULL,
    production_quantity_kg DECIMAL(10, 2) NOT NULL,
    production_quality ENUM('A', 'B', 'C', 'D') NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);  

-- Indexes for productions
CREATE INDEX idx_production_date ON productions(production_date);
CREATE INDEX idx_leaf_type ON productions(leaf_type);
CREATE INDEX idx_production_quality ON productions(production_quality);

-- Seed productions
INSERT INTO productions (production_date, production_cost, operator_id, leaf_type, production_quantity_kg, production_quality, remarks)
VALUES
    (CURDATE() - INTERVAL 1 DAY, 25000.00, 'OP-001', 'Green Leaves', 500.00, 'A', 'Morning batch'),
    (CURDATE(), 18000.00, 'OP-002', 'Bud Leaves', 320.00, 'B', 'Afternoon batch');

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    packing_date DATE NOT NULL,
    expired_date DATE NULL,
    tea_type VARCHAR(50) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    storage_condition VARCHAR(50) NOT NULL,
    temperature DECIMAL(5, 2) NULL,
    storage_location VARCHAR(255) NULL,
    opening_stock_kg DECIMAL(10, 2) NOT NULL,
    current_stock_kg DECIMAL(10, 2) NOT NULL,
    damaged_stock_kg DECIMAL(10, 2) NOT NULL,
    total_stock_value DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    cost_per_kg DECIMAL(10, 2) NOT NULL,
    used_in VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for inventory
CREATE INDEX idx_tea_type ON inventory(tea_type);
CREATE INDEX idx_grade ON inventory(grade);
CREATE INDEX idx_product_code ON inventory(product_code);
CREATE INDEX idx_packing_date ON inventory(packing_date);

-- Seed inventory
INSERT INTO inventory (
    product_name, product_code, packing_date, expired_date, tea_type, grade,
    storage_condition, temperature, storage_location, opening_stock_kg,
    current_stock_kg, damaged_stock_kg, total_stock_value, selling_price,
    cost_per_kg, used_in, remarks
)
VALUES
    (
        'Premium Green Tea',
        'GT-001',
        CURDATE() - INTERVAL 30 DAY,
        CURDATE() + INTERVAL 365 DAY,
        'Green tea',
        'OP',
        'cool',
        22.5,
        'Warehouse A, Shelf 1',
        100.00,
        95.50,
        2.00,
        50000.00,
        500.00,
        400.00,
        'Production Batch #101',
        'High quality premium tea'
    ),
    (
        'Classic Black Tea',
        'BT-002',
        CURDATE() - INTERVAL 15 DAY,
        CURDATE() + INTERVAL 730 DAY,
        'black tea',
        'BOP',
        'dry',
        25.0,
        'Warehouse B, Shelf 2',
        150.00,
        148.00,
        1.50,
        75000.00,
        450.00,
        350.00,
        'Production Batch #102',
        'Standard black tea blend'
    );

-- Quality table
CREATE TABLE IF NOT EXISTS quality (
    quality_id INT PRIMARY KEY AUTO_INCREMENT,
    batch_no VARCHAR(100) NOT NULL,
    production_date DATE NOT NULL,
    expiry_date DATE NULL,
    checked_by VARCHAR(255) NOT NULL,
    quality_standard_no VARCHAR(100) NOT NULL,
    moisture_in_percentage VARCHAR(50) NOT NULL,
    quality_status ENUM('approved', 'hold', 'Reprocess', 'rejected') NOT NULL,
    color_ ENUM('bright', 'dull', 'dark', 'light') NOT NULL,
    aroma ENUM('strong', 'medium', 'weak') NOT NULL,
    taste ENUM('excellent', 'good', 'average') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quality
CREATE INDEX idx_batch_no ON quality(batch_no);
CREATE INDEX idx_production_date ON quality(production_date);
CREATE INDEX idx_quality_status ON quality(quality_status);
CREATE INDEX idx_checked_by ON quality(checked_by);

-- Seed quality records
INSERT INTO quality (
    batch_no, production_date, expiry_date, checked_by, quality_standard_no,
    moisture_in_percentage, quality_status, color_, aroma, taste
)
VALUES
    (
        'BATCH-001',
        CURDATE() - INTERVAL 5 DAY,
        CURDATE() + INTERVAL 365 DAY,
        'Jane Smith',
        'QS-2024-001',
        '5.2%',
        'approved',
        'bright',
        'strong',
        'excellent'
    ),
    (
        'BATCH-002',
        CURDATE() - INTERVAL 2 DAY,
        CURDATE() + INTERVAL 365 DAY,
        'John Doe',
        'QS-2024-002',
        '6.1%',
        'hold',
        'light',
        'medium',
        'good'
    );

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    supply_id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email_id VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    supply_date DATE NOT NULL,
    gst_no VARCHAR(50) NULL,
    inspection_date VARCHAR(50) NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    contract_id VARCHAR(100) NULL,
    contract_status VARCHAR(100) NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    supplier_type ENUM('raw material supplier', 'leaf supplier', 'service suppliers') NOT NULL,
    item_supplied ENUM('green leaf', 'tea powder', 'packing material') NOT NULL,
    supply_frequency ENUM('daily', 'weekly', 'monthly') NOT NULL,
    suppliers_status ENUM('active', 'inactive') NOT NULL,
    suppliers_work ENUM('completed', 'pending', 'not completed', 'rejected') NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for suppliers
CREATE INDEX idx_supplier_id ON suppliers(supplier_id);
CREATE INDEX idx_suppliers_status ON suppliers(suppliers_status);
CREATE INDEX idx_supplier_type ON suppliers(supplier_type);
CREATE INDEX idx_supply_date ON suppliers(supply_date);

-- Seed suppliers
INSERT INTO suppliers (
    supplier_id, supplier_name, contact_person, email_id, address, location,
    supply_date, gst_no, inspection_date, price_per_kg, contract_id,
    contract_status, quantity, supplier_type, item_supplied, supply_frequency,
    suppliers_status, suppliers_work, remarks
)
VALUES
    (
        'SUP-001',
        'Green Leaf Suppliers Ltd',
        'Rajesh Kumar',
        'rajesh@greenleafsuppliers.com',
        '123 Tea Garden Road, Kandy',
        'Kandy, Central Province',
        CURDATE() - INTERVAL 10 DAY,
        'GST123456789',
        '2024-01-15',
        150.00,
        'CNT-2024-001',
        'Active',
        5000.00,
        'leaf supplier',
        'green leaf',
        'weekly',
        'active',
        'completed',
        'Reliable supplier with good quality leaves'
    ),
    (
        'SUP-002',
        'Premium Packing Materials Co',
        'Priya Sharma',
        'priya@premiumpacking.com',
        '456 Industrial Area, Colombo',
        'Colombo, Western Province',
        CURDATE() - INTERVAL 5 DAY,
        'GST987654321',
        '2024-01-20',
        25.00,
        'CNT-2024-002',
        'Pending',
        2000.00,
        'raw material supplier',
        'packing material',
        'monthly',
        'active',
        'pending',
        'Monthly supply contract for packaging materials'
    );

-- Transport table
CREATE TABLE IF NOT EXISTS transport (
    transport_id INT PRIMARY KEY AUTO_INCREMENT,
    vehicle_number VARCHAR(50) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_id VARCHAR(100) NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    license_number VARCHAR(100) NOT NULL,
    vehicle_capacity DECIMAL(10, 2) NOT NULL,
    source_location VARCHAR(255) NOT NULL,
    destination_location VARCHAR(255) NOT NULL,
    gps_tracking_id VARCHAR(100) NULL,
    distance_km DECIMAL(10, 2) NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL,
    cost_per_kg DECIMAL(10, 2) NOT NULL,
    fuel_consumption_ltrs DECIMAL(10, 2) NOT NULL,
    fuel_cost DECIMAL(10, 2) NOT NULL,
    toll_charges DECIMAL(10, 2) NOT NULL,
    transport_date DATE NOT NULL,
    delivered_date DATE NULL,
    starting_time TIME NOT NULL,
    arrival_time TIME NULL,
    delay_reason VARCHAR(255) NULL,
    vehicle_type ENUM('Lorry', 'truck', 'tempo', 'container', 'auto') NOT NULL,
    material_type ENUM('green leaf', 'tea powder', 'gunny bags', 'tin containers', 'labels & stickers', 'machinery parts', 'fuels', 'chemicals') NOT NULL,
    packaging_type ENUM('zip lock pouches', 'plastic tray boxes', 'wooden crates', 'jute bags', 'ventilated bags') NOT NULL,
    deliver_confirmation ENUM('yes', 'no') NOT NULL,
    receiver_name VARCHAR(255) NULL,
    receiver_signature VARCHAR(255) NULL,
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for transport
CREATE INDEX idx_vehicle_number ON transport(vehicle_number);
CREATE INDEX idx_driver_id ON transport(driver_id);
CREATE INDEX idx_transport_date ON transport(transport_date);
CREATE INDEX idx_vehicle_type ON transport(vehicle_type);
CREATE INDEX idx_material_type ON transport(material_type);

-- Seed transport records
INSERT INTO transport (
    vehicle_number, driver_name, driver_id, contact_number, license_number,
    vehicle_capacity, source_location, destination_location, gps_tracking_id,
    distance_km, quantity_kg, cost_per_kg, fuel_consumption_ltrs, fuel_cost,
    toll_charges, transport_date, delivered_date, starting_time, arrival_time,
    delay_reason, vehicle_type, material_type, packaging_type, deliver_confirmation,
    receiver_name, receiver_signature, remarks
)
VALUES
    (
        'TN-01-AB-1234',
        'Ramesh Kumar',
        'DRV-001',
        '+91 9876543210',
        'DL-1234567890',
        5000.00,
        'Factory, Kandy',
        'Warehouse, Colombo',
        'GPS-12345',
        150.50,
        2000.00,
        5.00,
        50.00,
        3500.00,
        500.00,
        CURDATE() - INTERVAL 3 DAY,
        CURDATE() - INTERVAL 3 DAY,
        '08:00:00',
        '14:30:00',
        NULL,
        'truck',
        'green leaf',
        'jute bags',
        'yes',
        'Warehouse Manager',
        'SIG-001',
        'On-time delivery, good condition'
    ),
    (
        'TN-02-CD-5678',
        'Suresh Patel',
        'DRV-002',
        '+91 9876543211',
        'DL-9876543210',
        3000.00,
        'Factory, Kandy',
        'Distribution Center, Galle',
        'GPS-12346',
        120.00,
        1500.00,
        4.50,
        40.00,
        2800.00,
        400.00,
        CURDATE() - INTERVAL 1 DAY,
        NULL,
        '09:00:00',
        NULL,
        'Traffic congestion',
        'Lorry',
        'tea powder',
        'zip lock pouches',
        'no',
        NULL,
        NULL,
        'In transit, expected delivery today'
    );

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    purchase_id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_date DATE NOT NULL,
    delivery_date DATE NULL,
    supplier_id VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_address TEXT NOT NULL,
    supplier_contact VARCHAR(50) NOT NULL,
    supplier_email VARCHAR(255) NOT NULL,
    material_name ENUM('green leaf', 'tea powder', 'labelling & stickers', 'tin containers', 'fuel', 'chemicals') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(12, 2) NOT NULL,
    purchase_status ENUM('approved', 'delivered', 'cancelled', 'pending') NOT NULL DEFAULT 'pending',
    transport_mode ENUM('lorry', 'auto', 'tempo') NOT NULL,
    delivery_status ENUM('received', 'not received') NOT NULL DEFAULT 'not received',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for purchase_orders
CREATE INDEX idx_purchase_date ON purchase_orders(purchase_date);
CREATE INDEX idx_po_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_status ON purchase_orders(purchase_status);

-- Seed purchase orders
INSERT INTO purchase_orders (
    purchase_date, delivery_date, supplier_id, supplier_name, supplier_address, 
    supplier_contact, supplier_email, material_name, unit_price, quantity, 
    total_cost, purchase_status, transport_mode, delivery_status, remarks
) VALUES
(
    CURDATE() - INTERVAL 5 DAY,
    CURDATE() - INTERVAL 2 DAY,
    'SUP-001',
    'Green Leaf Suppliers Ltd',
    '123 Tea Garden Road, Kandy',
    '+94 712345678',
    'rajesh@greenleafsuppliers.com',
    'green leaf',
    150.00,
    500.00,
    75000.00,
    'delivered',
    'lorry',
    'received',
    'High quality leaf batch'
),
(
    CURDATE(),
    NULL,
    'SUP-002',
    'Premium Packing Materials Co',
    '456 Industrial Area, Colombo',
    '+94 772223334',
    'priya@premiumpacking.com',
    'tin containers',
    45.00,
    1000.00,
    45000.00,
    'pending',
    'tempo',
    'not received',
    'Urgent requirement for packaging'
);


-- Payroll table
CREATE TABLE IF NOT EXISTS payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_date DATE NOT NULL,
    payee_name VARCHAR(255) NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_id VARCHAR(100) NULL,
    payment_type ENUM('salary', 'supplier', 'transport', 'purchase') NOT NULL,
    payment_category ENUM('employee', 'vendor', 'driver') NOT NULL,
    department ENUM('leaf Collection', 'Transport', 'Suppliers', 'production', 'inventory', 'quality', 'Accounts', 'HR') NULL,
    payment_mode ENUM('cash', 'bank', 'upi', 'gpay') NOT NULL,
    payment_status ENUM('paid', 'not paid', 'pending') NOT NULL DEFAULT 'pending',
    
    -- Employee specific fields
    employee_id VARCHAR(100) NULL,
    employee_name VARCHAR(255) NULL,
    designation VARCHAR(100) NULL,
    total_days_working DECIMAL(10, 2) NULL,
    attendance_days DECIMAL(10, 2) NULL,
    salary_amount DECIMAL(12, 2) NULL,
    salary_type ENUM('daily', 'weekly', 'monthly') NULL,
    working_time ENUM('parttime', 'full time') NULL,
    working_shift ENUM('morning', 'night') NULL,
    
    -- Supplier specific fields
    supplier_id VARCHAR(100) NULL,
    supplier_name VARCHAR(255) NULL,
    tax_gst VARCHAR(100) NULL,
    supplier_total_amount DECIMAL(12, 2) NULL,
    quantity_kg DECIMAL(10, 2) NULL,
    invoice_no VARCHAR(100) NULL,
    supply_date DATE NULL,
    supplier_specific_type ENUM('tea leaves', 'tea powder', 'machine parts', 'boxes', 'labels & stickers') NULL,
    
    -- Transport specific fields
    transport_id VARCHAR(100) NULL,
    vehicle_no VARCHAR(50) NULL,
    driver_name VARCHAR(255) NULL,
    distance DECIMAL(10, 2) NULL,
    driver_salary DECIMAL(10, 2) NULL,
    toll_charges DECIMAL(10, 2) NULL,
    loading_charges DECIMAL(10, 2) NULL,
    fuel_cost DECIMAL(10, 2) NULL,
    total_transport_cost DECIMAL(10, 2) NULL,
    trip_date DATE NULL,
    transport_type ENUM('lorry', 'auto', 'tempo', 'container') NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for payroll
CREATE INDEX idx_payment_date ON payroll(payment_date);
CREATE INDEX idx_payment_type ON payroll(payment_type);
CREATE INDEX idx_payment_status ON payroll(payment_status);

-- Seed payroll
INSERT INTO payroll (
    payment_date, payee_name, amount, transaction_id, payment_type, 
    payment_category, department, payment_mode, payment_status,
    employee_id, employee_name, designation, salary_type,
    created_at
) VALUES 
(
    CURDATE(), 'John Doe', 5000.00, 'TXN12345', 'salary', 
    'employee', 'production', 'bank', 'paid',
    'EMP001', 'John Doe', 'Worker', 'monthly',
    NOW()
),
(
    CURDATE(), 'Green Leaf Suppliers', 15000.00, 'TXN67890', 'supplier', 
    'vendor', 'Suppliers', 'upi', 'pending',
    NULL, NULL, NULL, NULL,
    NOW()
);


-- ============================================
-- SALES MANAGEMENT TABLES
-- ============================================

-- Customers table
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
    gst_number VARCHAR(50) NULL,
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_gst (gst_number)
);

-- Indexes for customers
CREATE INDEX idx_customer_type ON customers(customer_type);
CREATE INDEX idx_customer_status ON customers(status);

-- Sales table
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
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes for sales
CREATE INDEX idx_invoice_number ON sales(invoice_number);
CREATE INDEX idx_sale_date ON sales(sale_date);
CREATE INDEX idx_customer_id ON sales(customer_id);
CREATE INDEX idx_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_status ON sales(status);

-- Sales Items table
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
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id) ON DELETE RESTRICT
);

-- Indexes for sales_items
CREATE INDEX idx_sale_id ON sales_items(sale_id);
CREATE INDEX idx_inventory_id ON sales_items(inventory_id);

-- Payments table
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
    FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE
);

-- Indexes for payments
CREATE INDEX idx_sale_payment ON payments(sale_id);
CREATE INDEX idx_payment_date ON payments(payment_date);
CREATE INDEX idx_payment_status_idx ON payments(payment_status);

-- Sales Analytics table
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
    UNIQUE KEY unique_analytics (analytics_date, period_type)
);

-- Indexes for sales_analytics
CREATE INDEX idx_analytics_date ON sales_analytics(analytics_date);
CREATE INDEX idx_period_type ON sales_analytics(period_type);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (category, setting_key)
);

-- Indexes for settings
CREATE INDEX idx_settings_category ON settings(category);

-- Seed Settings
INSERT INTO settings (category, setting_key, setting_value, description) VALUES
('company', 'profile', '{"factory_name": "My Tea Factory", "owner_name": "Managing Director", "address": "123 Estate Road, Ooty", "contact": "9876543210", "email": "info@teafactory.com", "gst_number": "33AAAAA0000A1Z5", "fssai_license": "12345678901234", "financial_year": "2023-24", "currency": "INR"}', 'Global Company Profile Settings'),
('system', 'general', '{"language": "English", "date_format": "DD-MM-YYYY", "notifications_enabled": true, "sms_alerts": false, "email_alerts": true}', 'General System Configuration');

-- ============================================
-- SEED DATA FOR SALES MODULE
-- ============================================

-- Seed Customers
INSERT INTO customers (customer_name, customer_type, email, phone, address, city, state, pincode, gst_number, credit_limit, status)
VALUES
    ('Fresh Mart Retail', 'Retail', 'freshmart@example.com', '+919876543210', '123 Main Street', 'Bangalore', 'Karnataka', '560001', '29AAAAA0000A1Z5', 50000.00, 'active'),
    ('Green Valley Wholesale', 'Wholesale', 'greenvalley@example.com', '+919876543211', '456 Business Park', 'Ooty', 'Tamil Nadu', '643001', '33BBBBB0000B2Z5', 150000.00, 'active'),
    ('Quick Distribution Ltd', 'Distributor', 'quickdist@example.com', '+919876543212', '789 Logistics Hub', 'Erode', 'Tamil Nadu', '638001', '33CCCCC0000C3Z5', 250000.00, 'active'),
    ('Premium Tea Store', 'Retail', 'premiumtea@example.com', '+919876543213', '321 Shopping Mall', 'Coimbatore', 'Tamil Nadu', '641001', '33DDDDD0000D4Z5', 75000.00, 'active');

-- Seed Sales (with current date and yesterday)
INSERT INTO sales (invoice_number, customer_id, sale_date, sale_time, subtotal, discount_amount, discount_percentage, cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, total_profit, payment_mode, payment_status, created_by, status)
VALUES
    ('INV-2026-0001', 1, CURDATE() - INTERVAL 1 DAY, '10:30:00', 50000.00, 2500.00, 5.00, 2137.50, 2137.50, 0, 4275.00, 51775.00, 15000.00, 'Cash', 'completed', 1, 'completed'),
    ('INV-2026-0002', 2, CURDATE() - INTERVAL 1 DAY, '14:15:00', 75000.00, 3750.00, 5.00, 3206.25, 3206.25, 0, 6412.50, 77662.50, 22500.00, 'UPI', 'completed', 1, 'completed'),
    ('INV-2026-0003', 3, CURDATE(), '09:45:00', 100000.00, 5000.00, 5.00, 0, 0, 9500.00, 9500.00, 104500.00, 30000.00, 'Bank Transfer', 'completed', 1, 'completed');

-- Seed Sales Items
INSERT INTO sales_items (sale_id, inventory_id, product_name, product_code, quantity_sold, unit_price, cost_price, line_discount_amount, line_discount_percentage, line_subtotal, line_profit)
VALUES
    (1, 1, 'Premium Green Tea', 'GT-001', 25.00, 500.00, 400.00, 625.00, 5.00, 12375.00, 2500.00),
    (1, 2, 'Classic Black Tea', 'BT-002', 37.50, 450.00, 350.00, 1875.00, 5.00, 15625.00, 3750.00),
    (2, 1, 'Premium Green Tea', 'GT-001', 50.00, 500.00, 400.00, 1250.00, 5.00, 24750.00, 5000.00),
    (2, 2, 'Classic Black Tea', 'BT-002', 50.00, 450.00, 350.00, 2250.00, 5.00, 21250.00, 5000.00),
    (3, 1, 'Premium Green Tea', 'GT-001', 100.00, 500.00, 400.00, 2500.00, 5.00, 49500.00, 10000.00),
    (3, 2, 'Classic Black Tea', 'BT-002', 75.00, 450.00, 350.00, 2500.00, 5.00, 33750.00, 7500.00);

-- Seed Payments
INSERT INTO payments (sale_id, payment_amount, payment_date, payment_time, payment_mode, transaction_id, payment_status)
VALUES
    (1, 51775.00, CURDATE() - INTERVAL 1 DAY, '10:45:00', 'Cash', 'CASH-001', 'completed'),
    (2, 77662.50, CURDATE() - INTERVAL 1 DAY, '14:30:00', 'UPI', 'UPI-2026-001', 'completed'),
    (3, 104500.00, CURDATE(), '10:00:00', 'Bank Transfer', 'NEFT-2026-0001', 'completed');

-- Seed Sales Analytics
INSERT INTO sales_analytics (analytics_date, period_type, total_sales_count, total_sales_amount, total_profit, total_tax, total_discount, avg_order_value, customer_count, items_sold)
VALUES
    (CURDATE() - INTERVAL 1 DAY, 'daily', 2, 129437.50, 37500.00, 10687.50, 6250.00, 64718.75, 2, 162.50),
    (CURDATE(), 'daily', 1, 104500.00, 30000.00, 9500.00, 5000.00, 104500.00, 1, 175.00);
