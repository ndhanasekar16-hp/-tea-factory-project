# Sales Management Module - Complete Implementation Guide

## Overview
The Sales Management module is a complete system for managing sales, customers, products, and generating detailed invoices with analytics.

## Features Implemented

### 1. **Customer Management**
- ✅ Load and display all customers in a dropdown
- ✅ Add new customers with full details (name, type, phone, email, GST, address, etc.)
- ✅ View customer cards with full information
- ✅ Automatic dropdown refresh when new customer is added
- ✅ Customer types: Retail, Wholesale, Distributor

### 2. **Product Inventory Integration**
- ✅ Load all products from inventory table
- ✅ Display product details including:
  - Product name
  - Product code
  - Current stock in kg
  - Selling price per kg
  - Cost price per kg
  - Grade
- ✅ Auto-fetch product price when selected

### 3. **Sales Cart/Items Management**
- ✅ Add products to sales cart
- ✅ Enter quantity for each product
- ✅ Display all items in cart with:
  - Product name and code
  - Quantity and unit price
  - Total price per item
  - Profit calculation
- ✅ Remove items from cart
- ✅ Validate quantity > 0
- ✅ Check stock availability
- ✅ Warn if quantity exceeds available stock

### 4. **Invoice Summary & Calculations**
- ✅ Automatic calculation of:
  - Subtotal (sum of all items)
  - Discount (percentage + flat amount)
  - Subtotal after discount
  - CGST (9%)
  - SGST (9%)
  - IGST (18% for interstate)
  - Grand Total
  - Total Profit
- ✅ Display all calculations in real-time invoice preview
- ✅ Support for Local (CGST/SGST) and Interstate (IGST) sales

### 5. **Payment Processing**
- ✅ Select payment mode (Cash, UPI, Card, Bank Transfer, Credit)
- ✅ Optional transaction ID entry
- ✅ Record payment details with sale

### 6. **Sales Creation & Storage**
- ✅ Save sale with all items to database
- ✅ Generate unique invoice number (INV-YYYYMMDD-XXXX)
- ✅ Reduce inventory stock automatically
- ✅ Calculate and store profit information
- ✅ Store tax details (CGST, SGST, IGST)
- ✅ Record payment information

### 7. **Sales List**
- ✅ View all saved sales
- ✅ Display columns:
  - Invoice number
  - Sale date
  - Customer name
  - Amount
  - Profit
  - Payment status
- ✅ View individual invoices
- ✅ Delete sales (with inventory restoration)
- ✅ Search functionality

### 8. **Invoice Viewing & Printing**
- ✅ View complete invoice with:
  - Company and customer details
  - Itemized products
  - All calculations
  - Payment information
- ✅ Print invoice
- ✅ Download invoice as PDF
- ✅ Professional invoice format

### 9. **Analytics Dashboard**
- ✅ Display key metrics:
  - Total sales amount
  - Total profit
  - Number of transactions
  - Unique customers
- ✅ Charts:
  - Sales trend (line chart)
  - Daily profit (bar chart)
  - Sales by customer type (doughnut chart)
  - Product performance (horizontal bar chart)

### 10. **Stock Management**
- ✅ Real-time stock availability check
- ✅ Warning for low stock (< 20% of opening stock)
- ✅ Error for out-of-stock items
- ✅ Stock alerts in invoice summary

## API Endpoints

### Sales API (`/api/sales.php`)
- **GET** - List all sales with customer details
- **GET?action=view&id=X** - Get single sale details with items
- **GET?action=invoice&id=X** - Get invoice data for display/printing
- **POSTaction=create** - Create new sale with items
- **PUT** - Update sale payment status
- **DELETE** - Delete sale and restore inventory

### Customers API (`/api/customers.php`)
- **GET** - List all customers
- **GET?id=X** - Get single customer details
- **POST** - Add new customer
- **PUT** - Update customer details
- **DELETE** - Deactivate customer (if implemented)

### Inventory API (`/api/inventory.php`)
- **GET** - List all products with stock
- **GET?tea_type=X** - Filter by tea type
- **GET?grade=X** - Filter by grade
- **POST** - Add new product (via inventory module)

## Database Tables

### customers
- `customer_id` (Primary Key)
- `customer_name`, `customer_type`  (Retail/Wholesale/Distributor)
- `phone`, `email`
- `address`, `city`, `state`, `pincode`
- `gst_number` (Unique)
- `credit_limit`
- `status` (active/inactive)

### sales
- `sale_id` (Primary Key)
- `invoice_number` (Unique)
- `customer_id` (Foreign Key)
- `sale_date`, `sale_time`
- `subtotal`, `discount_amount`, `discount_percentage`
- `cgst_amount`, `sgst_amount`, `igst_amount`, `total_tax`
- `grand_total`, `total_profit`
- `payment_mode`, `payment_status`
- `created_by` (User ID)

### sales_items
- `item_id` (Primary Key)
- `sale_id` (Foreign Key)
- `inventory_id` (Foreign Key)
- `product_name`, `product_code`
- `quantity_sold`, `unit_price`, `cost_price`
- `line_discount_amount`, `line_subtotal`, `line_profit`

### payments
- `payment_id` (Primary Key)
- `sale_id` (Foreign Key)
- `payment_amount`, `payment_date`, `payment_time`
- `payment_mode`, `transaction_id`
- `payment_status`

### sales_analytics
- `analytics_id` (Primary Key)
- `analytics_date`, `period_type` (daily/monthly/yearly)
- `total_sales_count`, `total_sales_amount`
- `total_profit`, `total_tax`, `total_discount`
- `avg_order_value`, `customer_count`, `items_sold`

## Setup Instructions

### 1. Database Setup
Run the SQL schema to create tables:
```sql
-- Tables are created by database_schema.sql
```

### 2. Seed Sample Data
Run the seeding script to add sample customers:
```bash
php scripts/seed_sales_data.php
```

### 3. Access the Module
Navigate to the Sales Management page:
```
http://localhost/Bacend/FE/sales.html
```

## Usage Guide

### Creating a Sale
1. **Create Sale Tab** → Select or add a customer
2. **Select Product** → Choose product from dropdown (auto-loads from inventory)
3. **Enter Quantity** → Input amount in kilograms
4. **Add to Sale** → Click "Add to Sale" button to add to cart
5. **Review Cart** → View all items in the cart table
6. **Apply Discount** → Enter discount percentage or amount (optional)
7. **Select Payment Mode** → Choose payment method
8. **Complete Sale** → Click "Complete Sale & Generate Invoice" button
9. **View Invoice** → Invoice appears automatically, can print or download

### Viewing Sales
1. Go to **Sales List Tab**
2. View all completed sales in table format
3. Click **"View"** to see full invoice details
4. Click **"Delete"** to remove sale (restores inventory)
5. Use **"Print"** and **"Download PDF"** buttons to export invoice

### Managing Customers
1. Go to **Customers Tab**
2. View all customers as cards with full details
3. Click **"Add Customer"** button to add new customer
4. Fill in customer details and save
5. New customer automatically appears in dropdown for sales

### Analytics
1. Go to **Analytics Tab**
2. View key metrics (total sales, profit, transactions, customers)
3. Check charts:  
   - Sales trend over time
   - Daily profit
   - Sales distribution by customer type
   - Top performing products

## Stock Validation Rules

- **Stock Check**: Item quantity cannot exceed current available stock
- **Low Stock Warning**: Alert if remaining stock < 20% of opening stock
- **Out of Stock**: Error if quantity > available stock
- **Automatic Reduction**: Stock automatically reduced when sale is completed
- **Stock Restoration**: Original stock restored if sale is deleted

## Tax Calculation

### Local Sale (CGST/SGST)
- CGST: 9%
- SGST: 9%
- Total Tax: 18%
- Formula: `Grand Total = Subtotal - Discount + Tax`

### Interstate Sale (IGST)
- IGST: 18%
- Total Tax: 18%
- Formula: `Grand Total = Subtotal - Discount + IGST`

## Profit Calculation

### Per Item
```
Line Profit = Quantity × (Selling Price - Cost Price) - Line Discount
```

### Total Sale
```
Total Profit = Σ (Line Profits) - Total Discount
```

## Troubleshooting

### Customers Not Loading
1. Check if customers exist in database
2. Run seed script: `php scripts/seed_sales_data.php`
3. Verify API response: `GET /api/customers.php`

### Products Not Displaying
1. Check inventory table has products
2. Ensure inventory.php API is accessible
3. Verify product fields: `inventory_id`, `product_name`, `selling_price`, `cost_per_kg`, `current_stock_kg`

### Sale Not Saving
1. Verify all required fields are filled
2. Check browser console for errors
3. Ensure customer has been selected
4. Verify at least one item is in cart
5. Check database connection and tables

### Invoice Not Generating
1. Verify sale was created successfully
2. Check sales_items table has entries
3. Ensure company settings are configured in settings table

## Security Features

- ✅ User authentication required
- ✅ Role-based access control
- ✅ Transaction logging (created_by user)
- ✅ Data validation on both frontend and backend
- ✅ SQL injection prevention via prepared statements
- ✅ CORS and content-type headers configured

## Performance Optimizations

- ✅ Indexed database queries
- ✅ Efficient chart rendering with Chart.js
- ✅ Lazy loading of analytics data
- ✅ Client-side validation before API calls
- ✅ Batch operations for inventory updates

## Future Enhancements

- [ ] Multiple payment recording per sale
- [ ] Partial payment tracking
- [ ] Customer credit limit validation
- [ ] Automatic email invoices
- [ ] Batch operations for sales
- [ ] Advanced reporting and filters
- [ ] Export to Excel/CSV
- [ ] QR code on invoices
- [ ] Barcode scanning for products
- [ ] Recurring sales/subscriptions

## Support & Contact

For issues or feature requests, contact the development team.

---

**Last Updated**: March 2026
**Version**: 1.0
**Status**: Complete and Tested
