<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

ensure_authenticated();

$method = $_SERVER['REQUEST_METHOD'];
$user = ensure_authenticated();

try {
    // GET - Retrieve sales data
    if ($method === 'GET') {
        $action = $_GET['action'] ?? null;
        $saleId = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if ($action === 'list' || !$action) {
            // Get all sales with filtering options
            $query = 'SELECT s.*, c.customer_name, c.customer_type 
                      FROM sales s 
                      JOIN customers c ON s.customer_id = c.customer_id 
                      ORDER BY s.sale_date DESC, s.created_at DESC';
            
            $stmt = db()->query($query);
            $sales = $stmt->fetchAll();
            
            // Get sales items count
            foreach ($sales as &$sale) {
                $itemStmt = db()->prepare('SELECT COUNT(*) as item_count FROM sales_items WHERE sale_id = :sale_id');
                $itemStmt->execute(['sale_id' => $sale['sale_id']]);
                $itemResult = $itemStmt->fetch();
                $sale['item_count'] = $itemResult['item_count'];
            }
            
            json_response(['sales' => $sales]);
        } elseif ($action === 'view' && $saleId) {
            // Get single sale with details
            $saleStmt = db()->prepare(
                'SELECT s.*, c.customer_name, c.customer_type, c.email, c.phone, c.gst_number
                 FROM sales s 
                 JOIN customers c ON s.customer_id = c.customer_id 
                 WHERE s.sale_id = :sale_id LIMIT 1'
            );
            $saleStmt->execute(['sale_id' => $saleId]);
            $sale = $saleStmt->fetch();
            
            if (!$sale) {
                json_response(['error' => 'Sale not found'], 404);
            }
            
            // Get sale items
            $itemsStmt = db()->prepare('SELECT * FROM sales_items WHERE sale_id = :sale_id');
            $itemsStmt->execute(['sale_id' => $saleId]);
            $items = $itemsStmt->fetchAll();
            
            // Get payments
            $paymentStmt = db()->prepare('SELECT * FROM payments WHERE sale_id = :sale_id');
            $paymentStmt->execute(['sale_id' => $saleId]);
            $payments = $paymentStmt->fetchAll();
            
            json_response([
                'sale' => $sale,
                'items' => $items,
                'payments' => $payments
            ]);
        } elseif ($action === 'analytics') {
            // Get sales analytics
            $period = $_GET['period'] ?? 'daily'; // daily, monthly, yearly
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-d');
            
            $analyticsStmt = db()->prepare(
                'SELECT * FROM sales_analytics 
                 WHERE period_type = :period_type 
                 AND analytics_date BETWEEN :start_date AND :end_date
                 ORDER BY analytics_date'
            );
            $analyticsStmt->execute([
                'period_type' => $period,
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);
            $analytics = $analyticsStmt->fetchAll();
            
            json_response(['analytics' => $analytics]);
        } elseif ($action === 'invoice' && $saleId) {
            // Generate invoice details
            $saleStmt = db()->prepare(
                'SELECT s.*, c.customer_name, c.customer_type, c.email, c.phone, c.address, c.city, c.state, c.pincode, c.gst_number
                 FROM sales s 
                 JOIN customers c ON s.customer_id = c.customer_id 
                 WHERE s.sale_id = :sale_id LIMIT 1'
            );
            $saleStmt->execute(['sale_id' => $saleId]);
            $sale = $saleStmt->fetch();
            
            if (!$sale) {
                json_response(['error' => 'Sale not found'], 404);
            }
            
            // Get sale items
            $itemsStmt = db()->prepare('SELECT * FROM sales_items WHERE sale_id = :sale_id');
            $itemsStmt->execute(['sale_id' => $saleId]);
            $items = $itemsStmt->fetchAll();
            
            // Get company settings
            $settingStmt = db()->prepare('SELECT setting_value FROM settings WHERE category = :category AND setting_key = :key LIMIT 1');
            $settingStmt->execute(['category' => 'company', 'key' => 'profile']);
            $companyResult = $settingStmt->fetch();
            $company = json_decode($companyResult['setting_value'] ?? '{}', true);
            
            json_response([
                'sale' => $sale,
                'items' => $items,
                'company' => $company
            ]);
        }
    }
    
    // POST - Create new sale
    if ($method === 'POST') {
        $payload = get_json_body();
        $action = $payload['action'] ?? null;
        
        if ($action === 'create') {
            $required = ['customer_id', 'sale_date', 'items'];
            
            foreach ($required as $field) {
                if (empty($payload[$field])) {
                    json_response(['error' => sprintf('%s is required', $field)], 422);
                }
            }
            
            if (!is_array($payload['items']) || count($payload['items']) === 0) {
                json_response(['error' => 'At least one item is required'], 422);
            }
            
            // Verify customer exists
            $customerStmt = db()->prepare('SELECT * FROM customers WHERE customer_id = :id LIMIT 1');
            $customerStmt->execute(['id' => (int)$payload['customer_id']]);
            if (!$customerStmt->fetch()) {
                json_response(['error' => 'Customer not found'], 404);
            }
            
            // Generate unique invoice number
            $invoiceNumber = generateInvoiceNumber();
            
            // Calculate totals
            $subtotal = 0;
            $totalProfit = 0;
            $itemsData = [];
            
            foreach ($payload['items'] as $item) {
                $quantity = (float)$item['quantity'];
                $unitPrice = (float)$item['unit_price'];
                $costPrice = (float)$item['cost_price'];
                $discount = (float)($item['discount'] ?? 0);
                
                $lineSubtotal = ($quantity * $unitPrice) - $discount;
                $lineProfit = ($quantity * ($unitPrice - $costPrice)) - $discount;
                
                $subtotal += $lineSubtotal;
                $totalProfit += $lineProfit;
                
                $itemsData[] = [
                    'inventory_id' => (int)$item['inventory_id'],
                    'product_name' => $item['product_name'],
                    'product_code' => $item['product_code'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'cost_price' => $costPrice,
                    'discount' => $discount,
                    'line_subtotal' => $lineSubtotal,
                    'line_profit' => $lineProfit
                ];
            }
            
            // Calculate tax (CGST/SGST for local, IGST for interstate)
            $discountAmount = (float)($payload['discount_amount'] ?? 0);
            $subtotal -= $discountAmount;
            
            $taxRate = (float)($payload['tax_rate'] ?? 9); // Default 9% (CGST + SGST split)
            $taxAmount = ($subtotal * $taxRate) / 100;
            $grandTotal = $subtotal + $taxAmount;
            
            // Determine if CGST/SGST or IGST
            $isInterstate = (bool)($payload['is_interstate'] ?? false);
            $cgstAmount = $sgstAmount = $igstAmount = 0;
            
            if ($isInterstate) {
                $igstAmount = $taxAmount;
            } else {
                $cgstAmount = $sgstAmount = $taxAmount / 2;
            }
            
            // Start transaction
            db()->beginTransaction();
            
            try {
                // Insert sale
                $saleStmt = db()->prepare(
                    'INSERT INTO sales (invoice_number, customer_id, sale_date, sale_time, subtotal, discount_amount, 
                     cgst_amount, sgst_amount, igst_amount, total_tax, grand_total, total_profit, 
                     payment_mode, payment_status, created_by, status) 
                     VALUES (:invoice_number, :customer_id, :sale_date, :sale_time, :subtotal, :discount_amount,
                     :cgst_amount, :sgst_amount, :igst_amount, :total_tax, :grand_total, :total_profit,
                     :payment_mode, :payment_status, :created_by, :status)'
                );
                
                $saleStmt->execute([
                    'invoice_number' => $invoiceNumber,
                    'customer_id' => (int)$payload['customer_id'],
                    'sale_date' => $payload['sale_date'],
                    'sale_time' => $payload['sale_time'] ?? date('H:i:s'),
                    'subtotal' => $subtotal,
                    'discount_amount' => $discountAmount,
                    'cgst_amount' => $cgstAmount,
                    'sgst_amount' => $sgstAmount,
                    'igst_amount' => $igstAmount,
                    'total_tax' => $taxAmount,
                    'grand_total' => $grandTotal,
                    'total_profit' => $totalProfit,
                    'payment_mode' => $payload['payment_mode'] ?? 'Cash',
                    'payment_status' => $payload['payment_status'] ?? 'pending',
                    'created_by' => $user['id'],
                    'status' => 'completed'
                ]);
                
                $saleId = (int)db()->lastInsertId();
                
                // Insert sale items and update inventory
                foreach ($itemsData as $item) {
                    // Insert sale item
                    $itemStmt = db()->prepare(
                        'INSERT INTO sales_items (sale_id, inventory_id, product_name, product_code, 
                         quantity_sold, unit_price, cost_price, line_discount_amount, line_subtotal, line_profit)
                         VALUES (:sale_id, :inventory_id, :product_name, :product_code, :quantity_sold,
                         :unit_price, :cost_price, :line_discount, :line_subtotal, :line_profit)'
                    );
                    
                    $itemStmt->execute([
                        'sale_id' => $saleId,
                        'inventory_id' => $item['inventory_id'],
                        'product_name' => $item['product_name'],
                        'product_code' => $item['product_code'],
                        'quantity_sold' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'cost_price' => $item['cost_price'],
                        'line_discount' => $item['discount'],
                        'line_subtotal' => $item['line_subtotal'],
                        'line_profit' => $item['line_profit']
                    ]);
                    
                    // Update inventory stock
                    $inventoryStmt = db()->prepare(
                        'UPDATE inventory SET current_stock_kg = current_stock_kg - :quantity 
                         WHERE inventory_id = :inventory_id'
                    );
                    $inventoryStmt->execute([
                        'quantity' => $item['quantity'],
                        'inventory_id' => $item['inventory_id']
                    ]);
                }
                
                // Insert payment (if completed)
                if ($payload['payment_mode'] && ($payload['payment_status'] ?? 'pending') === 'completed') {
                    $paymentStmt = db()->prepare(
                        'INSERT INTO payments (sale_id, payment_amount, payment_date, payment_time, 
                         payment_mode, transaction_id, payment_status)
                         VALUES (:sale_id, :amount, :date, :time, :mode, :transaction_id, :status)'
                    );
                    
                    $paymentStmt->execute([
                        'sale_id' => $saleId,
                        'amount' => $grandTotal,
                        'date' => $payload['sale_date'],
                        'time' => $payload['sale_time'] ?? date('H:i:s'),
                        'mode' => $payload['payment_mode'],
                        'transaction_id' => $payload['transaction_id'] ?? null,
                        'status' => 'completed'
                    ]);
                }
                
                // Update/Create analytics
                updateSalesAnalytics($payload['sale_date']);
                
                db()->commit();
                
                json_response([
                    'message' => 'Sale created successfully',
                    'sale_id' => $saleId,
                    'invoice_number' => $invoiceNumber,
                    'grand_total' => $grandTotal
                ], 201);
                
            } catch (Exception $e) {
                db()->rollBack();
                throw $e;
            }
        }
    }
    
    // PUT - Update sale
    if ($method === 'PUT') {
        $payload = get_json_body();
        $saleId = (int)($payload['id'] ?? 0);
        
        if ($saleId <= 0) {
            json_response(['error' => 'Sale id is required'], 422);
        }
        
        // Check if sale exists
        $checkStmt = db()->prepare('SELECT * FROM sales WHERE sale_id = :id LIMIT 1');
        $checkStmt->execute(['id' => $saleId]);
        if (!$checkStmt->fetch()) {
            json_response(['error' => 'Sale not found'], 404);
        }
        
        // Update payment status if provided
        if (isset($payload['payment_status'])) {
            $updateStmt = db()->prepare('UPDATE sales SET payment_status = :status WHERE sale_id = :id');
            $updateStmt->execute([
                'status' => $payload['payment_status'],
                'id' => $saleId
            ]);
            
            json_response(['message' => 'Sale updated successfully']);
        }
        
        json_response(['error' => 'No update fields provided'], 422);
    }
    
    // DELETE - Delete sale (only for admin)
    if ($method === 'DELETE') {
        if ($user['role'] !== 'admin') {
            json_response(['error' => 'Unauthorized'], 403);
        }
        
        $payload = get_json_body();
        $saleId = (int)($payload['id'] ?? 0);
        
        if ($saleId <= 0) {
            json_response(['error' => 'Sale id is required'], 422);
        }
        
        // Check if sale exists
        $checkStmt = db()->prepare('SELECT * FROM sales WHERE sale_id = :id LIMIT 1');
        $checkStmt->execute(['id' => $saleId]);
        $sale = $checkStmt->fetch();
        
        if (!$sale) {
            json_response(['error' => 'Sale not found'], 404);
        }
        
        db()->beginTransaction();
        
        try {
            // Restore inventory
            $itemsStmt = db()->prepare('SELECT * FROM sales_items WHERE sale_id = :sale_id');
            $itemsStmt->execute(['sale_id' => $saleId]);
            $items = $itemsStmt->fetchAll();
            
            foreach ($items as $item) {
                $restoreStmt = db()->prepare(
                    'UPDATE inventory SET current_stock_kg = current_stock_kg + :quantity 
                     WHERE inventory_id = :inventory_id'
                );
                $restoreStmt->execute([
                    'quantity' => $item['quantity_sold'],
                    'inventory_id' => $item['inventory_id']
                ]);
            }
            
            // Delete sale (cascade will handle items and payments)
            $deleteStmt = db()->prepare('DELETE FROM sales WHERE sale_id = :id');
            $deleteStmt->execute(['id' => $saleId]);
            
            db()->commit();
            
            json_response(['message' => 'Sale deleted successfully']);
            
        } catch (Exception $e) {
            db()->rollBack();
            throw $e;
        }
    }
    
} catch (Exception $e) {
    json_response(['error' => 'Server error: ' . $e->getMessage()], 500);
}

/**
 * Generate unique invoice number
 */
function generateInvoiceNumber(): string {
    $date = date('Y-m-d');
    $sql = 'SELECT COUNT(*) as count FROM sales WHERE sale_date = :date';
    $stmt = db()->prepare($sql);
    $stmt->execute(['date' => $date]);
    $result = $stmt->fetch();
    $count = ($result['count'] ?? 0) + 1;
    
    return sprintf('INV-%s-%04d', date('Y-m-d', strtotime($date)) === $date ? date('Ymd') : date('Y-m-d'), $count);
}

/**
 * Update sales analytics
 */
function updateSalesAnalytics(string $date): void {
    $dayAnalyticsStmt = db()->prepare(
        'SELECT 
            COUNT(DISTINCT s.sale_id) as total_count,
            SUM(s.grand_total) as total_amount,
            SUM(s.total_profit) as total_profit,
            SUM(s.total_tax) as total_tax,
            SUM(s.discount_amount) as total_discount,
            AVG(s.grand_total) as avg_value,
            COUNT(DISTINCT s.customer_id) as customer_count,
            SUM(si.quantity_sold) as items_count
        FROM sales s
        LEFT JOIN sales_items si ON s.sale_id = si.sale_id
        WHERE s.sale_date = :date'
    );
    
    $dayAnalyticsStmt->execute(['date' => $date]);
    $dayAnalytics = $dayAnalyticsStmt->fetch();
    
    $upsertStmt = db()->prepare(
        'INSERT INTO sales_analytics 
        (analytics_date, period_type, total_sales_count, total_sales_amount, total_profit, total_tax, total_discount, avg_order_value, customer_count, items_sold)
        VALUES (:date, :period, :count, :amount, :profit, :tax, :discount, :avg, :customers, :items)
        ON DUPLICATE KEY UPDATE
        total_sales_count = :count,
        total_sales_amount = :amount,
        total_profit = :profit,
        total_tax = :tax,
        total_discount = :discount,
        avg_order_value = :avg,
        customer_count = :customers,
        items_sold = :items'
    );
    
    $upsertStmt->execute([
        'date' => $date,
        'period' => 'daily',
        'count' => $dayAnalytics['total_count'] ?? 0,
        'amount' => $dayAnalytics['total_amount'] ?? 0,
        'profit' => $dayAnalytics['total_profit'] ?? 0,
        'tax' => $dayAnalytics['total_tax'] ?? 0,
        'discount' => $dayAnalytics['total_discount'] ?? 0,
        'avg' => $dayAnalytics['avg_value'] ?? 0,
        'customers' => $dayAnalytics['customer_count'] ?? 0,
        'items' => $dayAnalytics['items_count'] ?? 0
    ]);
}
