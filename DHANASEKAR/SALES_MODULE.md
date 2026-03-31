# Advanced Sales Management Module - Tea Factory System

## Overview

The Advanced Sales Management Module is a comprehensive solution for managing end-to-end revenue operations in a manufacturing company. This module handles customer billing, invoice generation, profit analysis, stock management, and detailed sales analytics with professional reporting capabilities.

**Module Location:** `/FE/sales.html` and `/api/sales.php`

---

## Features

### 1. **Invoice Generation & Management**
- **Unique Invoice Numbers:** Auto-generated format `INV-YYYY-MM-DD-XXXX`
- **Invoice Details:**
  - Unique Sale ID and Invoice Number
  - Customer information (Name, Type, GST, Address)
  - Company details (Factory name, GST number)
  - Itemized product list with quantities and prices
  - Tax breakdown (CGST/SGST or IGST)
  - Grand total calculation
  - Payment status tracking

### 2. **Customer Management**
- **Customer Types:**
  - Retail
  - Wholesale
  - Distributor

- **Customer Details:**
  - Name, Email, Phone, Address
  - City, State, Pincode
  - GST Number (unique per customer)
  - Credit Limit tracking
  - Status (Active/Inactive)

- **Customer Operations:**
  - Add new customers on-the-fly
  - View customer directory
  - Update customer information
  - Filter by customer type

### 3. **Product Sales Management**
- **Real-time Product Selection:** Access inventory with current stock levels
- **Product Information:**
  - Product name and code
  - Current stock in kg
  - Unit price and cost price
  - Quality grade
  - Storage location

- **Dynamic Pricing:**
  - Unit price displayed per product
  - Cost price tracked for profit calculation
  - Quantity-based sales with decimal support (kg precision)

### 4. **Automatic Calculations**
- **Subtotal Calculation:** Sum of (Quantity × Unit Price) for all items
- **Discount Management:**
  - Percentage-based discount
  - Flat amount discount
  - Combined discount application
  
- **Tax Calculation:**
  - **Local Sales (CGST/SGST):**
    - CGST: 9%
    - SGST: 9%
    - Total: 18%
  
  - **Interstate Sales (IGST):**
    - IGST: 18%
  
  - Automatic tax switching based on sale type

- **Grand Total:** Subtotal - Discount + Tax
- **Profit Calculation:** (Unit Price - Cost Price) × Quantity - Discount per item

### 5. **Payment Tracking**
- **Multiple Payment Modes:**
  - Cash
  - UPI
  - Card
  - Bank Transfer
  - Credit (for credit sales)

- **Payment Status:**
  - Pending (for credit sales)
  - Completed (for immediate payment)

- **Transaction Tracking:**
  - Transaction ID/Reference number
  - Payment date and time
  - Payment mode recording
  - Payment history per sale

### 6. **Stock Management**
- **Real-time Stock Deduction:**
  - Automatic reduction of inventory when sale is completed
  - Quantity in kg precision
  - Prevents overselling

- **Stock Alerts:**
  - Low stock warning (< 20% of opening stock)
  - Out of stock prevention
  - Alert display in invoice summary
  - Color-coded status indicators

- **Stock Restoration:**
  - Automatic restoration when sales are deleted
  - Maintains inventory accuracy

### 7. **Profit Analysis**
- **Profit Calculation:**
  - Per item profit: (Unit Price - Cost Price) × Quantity
  - Discount impact on profit
  - Total profit per sale
  - Net profit after all deductions

- **Profit Insights:**
  - Total profit display in invoice summary
  - Daily profit tracking
  - Profit margin analysis
  - Profitability trends

### 8. **Sales Analytics & Reporting**
- **Summary Dashboard:**
  - Total Sales Amount (₹)
  - Total Profit Amount (₹)
  - Total Transactions Count
  - Unique Customers Count

- **Charts & Visualizations:**
  - **Sales Trend Chart:** Line graph showing daily sales trends
  - **Profit Margin Chart:** Bar graph for daily profit
  - **Customer Type Distribution:** Doughnut chart by customer type
  - **Product Performance:** Top 5 products by sales value

- **Analytics Periods:**
  - Daily analytics
  - Monthly analytics
  - Yearly analytics
  - Custom date range analysis

- **Report Generation:**
  - View detailed sales records
  - Search by invoice number or customer
  - Filter by date range
  - Export capabilities

### 9. **Invoice Printing & Export**
- **Multiple Export Formats:**
  - Print to PDF
  - Print to physical printer
  - Save as PDF file

- **Invoice Content:**
  - Company branding
  - Customer details
  - Itemized product list
  - Tax breakdown
  - Payment information
  - Professional formatting

- **File Naming:** `Invoice-INV-YYYY-MM-DD-XXXX.pdf`

### 10. **Role-Based Access Control**
- **Admin Access:** Full access to all features including deletion
- **Staff Access:** Create sales, view records, generate invoices
- **View-only Access:** Can view analytics and reports only

---

## Database Schema

### Tables Created

#### 1. **customers**
```sql
- customer_id (PK)
- customer_name
- customer_type (Retail/Wholesale/Distributor)
- email
- phone
- address, city, state, pincode
- gst_number (UNIQUE)
- credit_limit
- status
- created_at, updated_at
```

#### 2. **sales**
```sql
- sale_id (PK)
- invoice_number (UNIQUE)
- customer_id (FK)
- sale_date, sale_time
- subtotal
- discount_amount, discount_percentage
- cgst_amount, sgst_amount, igst_amount
- total_tax
- grand_total
- total_profit
- payment_mode
- payment_status
- created_by (FK → users)
- status
- remarks
- created_at, updated_at
```

#### 3. **sales_items**
```sql
- item_id (PK)
- sale_id (FK)
- inventory_id (FK)
- product_name, product_code
- quantity_sold
- unit_price, cost_price
- line_discount_amount, line_discount_percentage
- line_subtotal
- line_profit
- created_at
```

#### 4. **payments**
```sql
- payment_id (PK)
- sale_id (FK)
- payment_amount
- payment_date, payment_time
- payment_mode
- transaction_id
- payment_status
- remarks
- created_at
```

#### 5. **sales_analytics**
```sql
- analytics_id (PK)
- analytics_date
- period_type (daily/monthly/yearly)
- total_sales_count
- total_sales_amount
- total_profit
- total_tax
- total_discount
- avg_order_value
- customer_count
- items_sold
- created_at, updated_at
```

---

## API Endpoints

### Sales API (`/api/sales.php`)

#### GET Endpoints

**1. List All Sales**
```
GET /api/sales.php?action=list
Response: { sales: [...] }
```

**2. View Single Sale**
```
GET /api/sales.php?action=view&id=1
Response: { sale: {...}, items: [...], payments: [...] }
```

**3. Get Analytics**
```
GET /api/sales.php?action=analytics&period=daily&start_date=2026-02-01&end_date=2026-02-04
Response: { analytics: [...] }
```

**4. Get Invoice Details**
```
GET /api/sales.php?action=invoice&id=1
Response: { sale: {...}, items: [...], company: {...} }
```

#### POST Endpoints

**Create Sale**
```json
POST /api/sales.php
{
  "action": "create",
  "customer_id": 1,
  "sale_date": "2026-02-04",
  "sale_time": "10:30:00",
  "items": [
    {
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity": 25.5,
      "unit_price": 500,
      "cost_price": 400,
      "discount": 100
    }
  ],
  "discount_amount": 0,
  "discount_percentage": 5,
  "tax_rate": 18,
  "is_interstate": false,
  "payment_mode": "Cash",
  "payment_status": "completed",
  "transaction_id": "TXN123"
}
```

#### PUT Endpoints

**Update Sale**
```json
PUT /api/sales.php
{
  "id": 1,
  "payment_status": "completed"
}
```

#### DELETE Endpoints

**Delete Sale** (Admin only)
```json
DELETE /api/sales.php
{
  "id": 1
}
```

### Customers API (`/api/customers.php`)

#### GET Endpoints

**List All Customers**
```
GET /api/customers.php
```

**Get Single Customer**
```
GET /api/customers.php?id=1
```

**Filter by Type**
```
GET /api/customers.php?type=Retail
```

#### POST Endpoints

**Create Customer**
```json
POST /api/customers.php
{
  "customer_name": "ABC Retail Store",
  "customer_type": "Retail",
  "phone": "+919876543210",
  "email": "abc@example.com",
  "gst_number": "29AAAAA0000A1Z5",
  "credit_limit": 50000,
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

#### PUT Endpoints

**Update Customer**
```json
PUT /api/customers.php
{
  "id": 1,
  "customer_name": "New Name",
  "email": "new@example.com",
  "phone": "+919999999999"
}
```

---

## User Interface Walkthrough

### 1. Create Sale Tab
**Steps to Create a Sale:**

1. **Select Customer:**
   - Click "Select Customer" dropdown
   - Choose from existing customers or click "Add New Customer"
   - Customer details auto-populate

2. **Add Products:**
   - Select product from dropdown (shows current stock)
   - Enter quantity in kg
   - Click "Add to Sale"
   - Repeat for multiple products

3. **Apply Discount:**
   - Enter discount percentage (0-100) OR
   - Enter discount amount (₹)
   - Both applied cumulatively

4. **Set Sale Type:**
   - Local (CGST/SGST) or Interstate (IGST)
   - Tax calculated automatically

5. **Select Payment Mode:**
   - Choose: Cash, UPI, Card, Bank Transfer, Credit
   - Optionally enter Transaction ID

6. **Complete Sale:**
   - Click "Complete Sale & Generate Invoice"
   - Invoice auto-generated with unique number
   - Stock automatically deducted
   - Invoice saved to database

### 2. Sales List Tab
**Features:**

- View all sales records in table format
- Search by invoice number or customer name
- Click "View" to see full invoice details
- Click "Delete" to remove sale (admin only)
- Automatic stock restoration on delete

### 3. Analytics Tab
**Dashboard Shows:**

- Summary cards: Total Sales, Profit, Transactions, Customers
- Sales Trend line chart (daily sales over time)
- Profit Margin bar chart (daily profit)
- Customer Type distribution doughnut chart
- Product Performance top 5 products chart

### 4. Customers Tab
**Features:**

- Grid view of all customers
- Customer type badge
- Contact information
- GST number
- Credit limit
- "Add Customer" button for new customers

---

## Key Features in Detail

### Automatic Stock Management

When a sale is created:
1. **Validation:** Check if sufficient stock exists
2. **Deduction:** Reduce inventory `current_stock_kg`
3. **Tracking:** Maintain original `opening_stock_kg` for reference
4. **Alerts:** Display low stock warnings (< 20% of opening stock)

If sale is deleted:
1. **Restoration:** Add quantities back to inventory
2. **Accuracy:** Maintains inventory integrity

### Tax Calculation Logic

**For Local Sales:**
- CGST = (Subtotal - Discount) × 9%
- SGST = (Subtotal - Discount) × 9%
- Total Tax = CGST + SGST = 18%

**For Interstate Sales:**
- IGST = (Subtotal - Discount) × 18%
- CGST = 0
- SGST = 0

### Profit Calculation

**Per Item:**
```
Line Profit = (Quantity × Unit Price) - (Quantity × Cost Price) - Line Discount
```

**Total Sale Profit:**
```
Total Profit = Sum of all line profits
```

### Invoice Generation

Invoices include:
- Company letterhead
- Invoice number (unique)
- Customer billing address
- Itemized products with quantities and prices
- GST/Tax breakdown
- Grand total
- Payment method and status
- Timestamp

---

## Sample Data

### Seed Customers
- Fresh Mart Retail - Retail
- Green Valley Wholesale - Wholesale
- Quick Distribution Ltd - Distributor
- Premium Tea Store - Retail

### Seed Sales
- 3 sample sales with different customer types
- Various payment modes (Cash, UPI, Bank Transfer)
- Realistic tax calculations
- Profit analysis per transaction

### Seed Products (from inventory)
- Premium Green Tea (GT-001)
- Classic Black Tea (BT-002)

---

## Excel-Like Features

- **Real-time Calculations:** Changes update instantly
- **Decimal Support:** Handle quantities in decimals (kg)
- **Multi-currency:** All amounts in INR (₹)
- **Summary Row:** Always visible invoice summary
- **Validation:** Prevent overselling with stock checks

---

## Security Features

1. **Authentication Required:** All endpoints protected
2. **Role-Based Access:** Admin-only deletion
3. **Input Validation:** All inputs validated on backend
4. **SQL Injection Prevention:** Prepared statements used
5. **Data Integrity:** Transactions ensure consistency
6. **Audit Trail:** Created_by field tracks who created sales

---

## Error Handling

The module includes comprehensive error handling:

- **Missing Data Errors:** Clear messages for required fields
- **Stock Errors:** Prevent selling more than available
- **Duplicate Errors:** GST numbers and invoice numbers unique
- **Validation Errors:** All inputs validated
- **Server Errors:** Graceful error messages to user
- **Transaction Rollback:** Failed sales don't affect inventory

---

## Performance Optimizations

1. **Database Indexes:** Created on frequently queried columns
2. **Lazy Loading:** Data loaded on tab switch
3. **Efficient Queries:** Minimized database calls
4. **Chart Optimization:** Chart.js library for fast rendering
5. **Caching:** Customer and product lists cached

---

## Future Enhancements

1. **Credit Management:** Track customer credit limits and aging
2. **Inventory Forecasting:** Predict stock needs based on sales trends
3. **Multi-currency Support:** Handle international transactions
4. **Payment Reconciliation:** Automatic bank statement matching
5. **Advanced Analytics:** Seasonality analysis, forecasting
6. **Email Invoices:** Auto-send to customer email
7. **Mobile App:** React Native mobile version
8. **Bulk Import:** CSV upload for sales
9. **Commission Tracking:** Salesman commission calculation
10. **Multi-warehouse:** Support for multiple locations

---

## Troubleshooting

### Issue: Products not showing
**Solution:** Ensure inventory API is working and products exist

### Issue: Stock not deducting
**Solution:** Check database transaction support (InnoDB required)

### Issue: Invoice not generating
**Solution:** Verify sale ID is created successfully in database

### Issue: Charts not displaying
**Solution:** Check Chart.js library is loaded and no JS errors

### Issue: PDF not downloading
**Solution:** Verify html2pdf library is loaded and popup not blocked

---

## Database Initialization

To initialize the sales module:

1. **Run database migration:**
   ```sql
   mysql -u root tea_factory < database_schema.sql
   ```

2. **Verify tables created:**
   ```sql
   SHOW TABLES LIKE '%sale%';
   SHOW TABLES LIKE 'customers';
   SHOW TABLES LIKE 'payments';
   ```

3. **Check sample data:**
   ```sql
   SELECT * FROM customers;
   SELECT * FROM sales;
   SELECT COUNT(*) FROM sales_items;
   ```

---

## Support & Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

For module workflows, see [FLOWS.md](FLOWS.md)

For role-based access control, see [MODULES.md](MODULES.md)

---

## Version Information

- **Module Version:** 1.0.0
- **Release Date:** February 4, 2026
- **Database Version:** MySQL 5.7+
- **PHP Version:** 7.4+
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## License & Credits

Developed for Tea Factory Management System
© 2026 All Rights Reserved
