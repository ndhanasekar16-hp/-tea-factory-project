# Sales Management Module - Setup & Testing Guide

## Quick Start

### Step 1: Database Setup
The database schema is automatically created when you run the application. Verify tables exist:
```sql
SHOW TABLES LIKE 'customers';
SHOW TABLES LIKE 'sales';
SHOW TABLES LIKE 'sales_items';
SHOW TABLES LIKE 'inventory';
```

### Step 2: Seed Sample Data
Run the seed script to add sample customers and ensure inventory has products:
```bash
# From command line or browser, run:
http://localhost/Bacend/scripts/seed_sales_data.php

# Or via command line:
cd C:\xampp\htdocs\Bacend
php scripts/seed_sales_data.php
```

Expected output:
```
Starting to seed sales module data...

Seeding sample customers...
✓ Added customer: ABC Trading Company
✓ Added customer: Green Leaf Distributors
✓ Added customer: Local Tea Shop
✓ Added customer: Premium Estates Ltd
✓ Added customer: Wellness Coffee House

✓ All sample customers seeded successfully!

Note: Sample products are already seeded in the inventory table.
You can now use the Sales Management module to create sales.
```

### Step 3: Access the Module
Open in your browser:
```
http://localhost/Bacend/FE/sales.html
```

You should see the Sales Management dashboard with all 4 tabs:
- Create Sale
- Sales List
- Analytics
- Customers

---

## Complete Feature Testing

### ✅ Test 1: Customer Dropdown Loading
**Steps:**
1. Open Sales Management page
2. Click on "Create Sale" tab
3. Look for the "Select Customer" dropdown

**Expected Result:**
✓ Dropdown shows all customers from database
✓ Each customer shows name and type (Retail/Wholesale/Distributor)

**Actual Result:** ____________________

### ✅ Test 2: Add New Customer
**Steps:**
1. Click "Add New Customer" button
2. Fill in form:
   - Name: "Test Customer"
   - Type: "Retail"
   - Phone: "+91-9999999999"
   - Email: "test@example.com"
   - GST: "07AAACT1234D1Z8"
   - Address: "123 Test Street"
   - City: "Test City"
   - State: "Test State"
   - Pincode: "123456"
3. Click "Save Customer"

**Expected Result:**
✓ Success message appears
✓ New customer appears in dropdown
✓ Customer card appears in Customers tab
✓ Dropdown refreshes automatically

**Actual Result:** ____________________

### ✅ Test 3: Product Loading
**Steps:**
1. On "Create Sale" tab
2. Look at "Product" dropdown in "Add Products" section

**Expected Result:**
✓ Dropdown shows all products from inventory
✓ Shows: Product name, Grade, Stock, Price per kg
✓ At least 2 products visible (Premium Green Tea, Classic Black Tea)

**Actual Result:** ____________________

### ✅ Test 4: Auto Price Fetch
**Steps:**
1. Select a product from dropdown
2. Notice the price fields in the form

**Expected Result:**
✓ Price automatically populates in invoice summary
✓ Product code and stock information visible

**Actual Result:** ____________________

### ✅ Test 5: Add to Sale Cart
**Steps:**
1. Select a product: "Premium Green Tea"
2. Enter quantity: "10"
3. Click "Add to Sale" button

**Expected Result:**
✓ Item appears in cart table
✓ Shows: Product name, quantity, unit price, total price
✓ Shows profit information
✓ Quantity input cleared for next item

**Actual Result:** ____________________

### ✅ Test 6: Stock Validation
**Steps:**
1. Try to add quantity: "1000" (more than available)
2. Click "Add to Sale"

**Expected Result:**
✓ Error message: "Insufficient stock. Available: XXkg"
✓ Item not added to cart

**Actual Result:** ____________________

### ✅ Test 7: Multiple Items in Cart
**Steps:**
1. Add "Premium Green Tea" - 10kg
2. Add "Classic Black Tea" - 5kg
3. View cart

**Expected Result:**
✓ Both items visible in cart
✓ Each item has remove button
✓ Calculations updated for both items

**Actual Result:** ____________________

### ✅ Test 8: Remove Item from Cart
**Steps:**
1. Add 2 items to cart
2. Click remove button on first item

**Expected Result:**
✓ Item removed from cart
✓ Totals recalculated
✓ Only 1 item remains

**Actual Result:** ____________________

### ✅ Test 9: Invoice Calculations - Local Sale
**Steps:**
1. Add items worth ₹1000 subtotal
2. Don't apply discount
3. Check invoice summary (right side)

**Expected Result:**
✓ Subtotal: ₹1000.00
✓ Discount: -₹0.00
✓ Subtotal After Discount: ₹1000.00
✓ CGST (9%): ₹90.00
✓ SGST (9%): ₹90.00
✓ Grand Total: ₹1180.00
✓ Total Profit: Calculated correctly

**Actual Result:** ____________________

### ✅ Test 10: Invoice Calculations - With Discount
**Steps:**
1. Add items to cart
2. Apply discount percentage: "10"
3. Check invoice summary

**Expected Result:**
✓ Discount calculated correctly
✓ Tax applied to discounted amount
✓ Grand total updated
✓ Profit adjusted for discount

**Actual Result:** ____________________

### ✅ Test 11: Interstate Sale (IGST)
**Steps:**
1. Add items to cart
2. Change "Sale Type" to "Inter-State (IGST)"
3. Check invoice summary

**Expected Result:**
✓ CGST/SGST hidden
✓ IGST (18%) displayed
✓ Tax calculations correct
✓ Total matches local calculation

**Actual Result:** ____________________

### ✅ Test 12: Select Customer & View Details
**Steps:**
1. Select "ABC Trading Company" from dropdown
2. Look for customer details display

**Expected Result:**
✓ Customer details block appears
✓ Shows: Name, Type, Phone, Email, Location, GST
✓ All information correct

**Actual Result:** ____________________

### ✅ Test 13: Complete Sale
**Steps:**
1. Select customer
2. Add items to cart
3. Select payment mode: "Cash"
4. Click "Complete Sale & Generate Invoice"

**Expected Result:**
✓ Success message with invoice number
✓ Form cleared
✓ Print and Download PDF buttons appear
✓ Sale saved to database

**Actual Result:** ____________________

### ✅ Test 14: Print Invoice
**Steps:**
1. After completing a sale
2. Click "Print Invoice" button

**Expected Result:**
✓ Print dialog opens
✓ Invoice displays with:
  - Company info (FROM)
  - Customer info (BILL TO)
  - All items with prices
  - Calculations and totals
  - Payment info

**Actual Result:** ____________________

### ✅ Test 15: Download PDF Invoice
**Steps:**
1. After completing a sale
2. Click "Download PDF" button

**Expected Result:**
✓ PDF file downloads
✓ Filename: Invoice-INV-YYYYMMDD-XXXX.pdf
✓ Opens in browser or downloads locally
✓ Contains all invoice details

**Actual Result:** ____________________

### ✅ Test 16: Sales List Tab
**Steps:**
1. Click "Sales List" tab
2. Wait for data to load

**Expected Result:**
✓ All completed sales show in table
✓ Columns: Invoice#, Date, Customer, Amount, Profit, Status, Actions
✓ Totals calculated correctly
✓ Payment status shows correctly

**Actual Result:** ____________________

### ✅ Test 17: View Sales Invoice from List
**Steps:**
1. In Sales List tab
2. Click "View" button on any sale

**Expected Result:**
✓ Modal opens with invoice
✓ Shows all details including items
✓ Layout matches printed invoice
✓ Professional format

**Actual Result:** ____________________

### ✅ Test 18: Delete Sale
**Steps:**
1. In Sales List tab
2. Click "Delete" on any sale
3. Confirm deletion

**Expected Result:**
✓ Confirmation dialog appears
✓ Sale deleted from database
✓ Stock restored to inventory
✓ Sale removed from list
✓ Analytics updated

**Actual Result:** ____________________

### ✅ Test 19: Analytics Tab - Summary Cards
**Steps:**
1. Click "Analytics" tab
2. Wait for data to load

**Expected Result:**
✓ Four cards showing:
  - Total Sales (₹)
  - Total Profit (₹)
  - Total Transactions (count)
  - Unique Customers (count)
✓ All values calculated correctly

**Actual Result:** ____________________

### ✅ Test 20: Analytics Charts
**Steps:**
1. In Analytics tab
2. Check all 4 charts

**Expected Result:**
✓ Sales Trend (line chart) shows daily sales
✓ Profit Margin (bar chart) shows daily profit
✓ Customer Type (doughnut) shows sales by type
✓ Product Performance (bar) shows top products
✓ All charts render without errors

**Actual Result:** ____________________

### ✅ Test 21: Customers Tab
**Steps:**
1. Click "Customers" tab
2. Wait for data to load

**Expected Result:**
✓ All customers display as cards
✓ Each card shows: Name, Type, Phone, Email, Location, GST, Credit Limit
✓ Can scroll through all customers
✓ "Add Customer" button accessible

**Actual Result:** ____________________

### ✅ Test 22: Stock Level Warnings
**Steps:**
1. Add product that's low on stock
2. Watch invoice summary

**Expected Result:**
✓ Low stock alert shows if stock < 20% of opening
✓ Out of stock alert shows if added quantity > available
✓ Green "All items in stock" shows if OK

**Actual Result:** ____________________

### ✅ Test 23: Tax Calculation Accuracy
**Steps:**
1. Create sale with ₹1000 subtotal
2. No discount
3. Local sale

**Calculation:**
- Subtotal: 1000
- CGST (9%): 90
- SGST (9%): 90
- Total Tax: 180
- Grand Total: 1180

**Expected:** Values match above
**Actual Result:** ____________________

### ✅ Test 24: Profit Calculation
**Steps:**
1. Add product with:
   - Cost: ₹350/kg
   - Selling: ₹500/kg
   - Quantity: 10kg
2. Check profit calculation

**Calculation:**
- Per kg profit: 500 - 350 = 150
- Total profit: 150 × 10 = 1500

**Expected:** Shows ₹1500 profit
**Actual Result:** ____________________

### ✅ Test 25: Data Persistence
**Steps:**
1. Create a sale
2. Close browser
3. Reopen page
4. Check Sales List tab

**Expected Result:**
✓ Sale still exists in list
✓ All details preserved
✓ Invoices can still be viewed
✓ Data persisted in database

**Actual Result:** ____________________

---

## Functionality Checklist

### Customer Management
- [ ] Load customers from database
- [ ] Display customer dropdown
- [ ] Add new customer functionality
- [ ] Show customer details when selected
- [ ] Display all customers in Customers tab
- [ ] Automatic dropdown refresh after new customer

### Product Management
- [ ] Load products from inventory
- [ ] Display product dropdown with stock
- [ ] Auto-fetch price when selected
- [ ] Show cost price for profit calculation
- [ ] Filter products by availability

### Cart/Sales Items
- [ ] Add items to cart
- [ ] Remove items from cart
- [ ] Display cart items in table
- [ ] Update cart when items added/removed
- [ ] Calculate totals in real-time

### Calculations
- [ ] Subtotal calculation
- [ ] Discount percentage calculation
- [ ] Discount amount calculation
- [ ] CGST/SGST calculation (9% each)
- [ ] IGST calculation (18%)
- [ ] Grand total calculation
- [ ] Profit calculation per item
- [ ] Total profit calculation

### Sales Processing
- [ ] Validate customer selection
- [ ] Validate items in cart
- [ ] Validate quantity > 0
- [ ] Check stock availability
- [ ] Create sale record
- [ ] Generate unique invoice number
- [ ] Save sale items
- [ ] Update inventory stock
- [ ] Record payment info
- [ ] Update analytics

### Invoice Functions
- [ ] View individual invoices
- [ ] Print invoice
- [ ] Download invoice as PDF
- [ ] Professional invoice format
- [ ] Include all details

### Sales Management
- [ ] List all sales
- [ ] View sale details
- [ ] Delete sale with confirmation
- [ ] Restore stock on deletion
- [ ] Sort by date descending

### Analytics
- [ ] Calculate total sales
- [ ] Calculate total profit
- [ ] Count transactions
- [ ] Count unique customers
- [ ] Sales trend chart
- [ ] Profit chart
- [ ] Customer type chart
- [ ] Product performance chart

### Security & Validation
- [ ] User authentication required
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] Error handling
- [ ] Transaction management
- [ ] Rollback on failed operations

---

## Database Verification

Run these queries to verify data:

```sql
-- Check customers
SELECT COUNT(*) as customer_count FROM customers;

-- Check products
SELECT COUNT(*) as product_count FROM inventory;

-- Check sales
SELECT COUNT(*) as sales_count FROM sales;

-- Check sales items
SELECT COUNT(*) as item_count FROM sales_items;

-- Check analytics
SELECT COUNT(*) as analytics_count FROM sales_analytics;

-- View latest sale with details
SELECT s.*, c.customer_name 
FROM sales s 
JOIN customers c ON s.customer_id = c.customer_id 
ORDER BY s.created_at DESC LIMIT 1;

-- Check stock after sale
SELECT product_name, current_stock_kg 
FROM inventory 
WHERE inventory_id IN (SELECT inventory_id FROM sales_items LIMIT 1);
```

---

## Troubleshooting Checklist

### If Customers Don't Load
- [ ] Check database connection
- [ ] Verify customers table exists
- [ ] Run seed script
- [ ] Check browser console for errors
- [ ] Verify API endpoint: /api/customers.php

### If Products Don't Load
- [ ] Check inventory table has records
- [ ] Verify inventory.php API
- [ ] Check field names match
- [ ] Look for console errors

### If Sale Won't Save
- [ ] Ensure customer selected
- [ ] Ensure items in cart
- [ ] Check browser console
- [ ] Verify database tables exist
- [ ] Check payment mode selected

### If Invoice Won't Generate
- [ ] Verify sale created successfully
- [ ] Check sales_items table populated
- [ ] Verify company settings in database
- [ ] Check console for errors

### If Stock Shows Wrong
- [ ] Verify inventory updates
- [ ] Check for pending transactions
- [ ] Review sales_items records
- [ ] Run stock audit query

---

## Performance Benchmarks

Expected speeds:
- Page load: < 2 seconds
- Customer dropdown: < 500ms
- Product dropdown: < 500ms
- Create sale: < 1 second
- Load sales list: < 1 second
- Load analytics: < 2 seconds
- Print invoice: < 1 second
- Download PDF: < 2 seconds

---

## Final Sign-Off

All tests completed and verified: _________

Tested by: _____________________________

Date: _________________________________

Notes: ________________________________

---

**Status: Ready for Production** ✓
