# Sales Module - Quick Start Guide

## 📋 Overview

The Advanced Sales Management Module is now fully integrated into your Tea Factory Management System. This guide will help you get started quickly.

## 🚀 Getting Started

### Step 1: Access the Module
1. Log in to your Tea Factory Management System
2. From the Dashboard, click the **"Sales"** button in Quick Actions
3. Or navigate directly to `/FE/sales.html`

### Step 2: Create Your First Sale

#### Method A: Using Dashboard Quick Action
1. Click **Sales** button → Automatically opens sales module
2. Module loads with tabs: Create Sale, Sales List, Analytics, Customers

#### Method B: Direct Navigation
1. Click the Sales link from sidebar
2. You'll land on "Create Sale" tab by default

## 💼 Creating a Sale - Step by Step

### 1. **Select Customer**
   ```
   ✓ Click "Select Customer" dropdown
   ✓ Choose from existing customers
   ✗ Don't have a customer? Click "Add New Customer" button
   ```

### 2. **Add a New Customer (if needed)**
   ```
   Form Fields:
   - Customer Name * (required)
   - Customer Type * (Retail/Wholesale/Distributor)
   - Phone * (required)
   - Email (optional)
   - GST Number (optional but recommended)
   - Credit Limit (for credit sales)
   - Address, City, State, Pincode
   
   Click "Save Customer" → Customer added and selected
   ```

### 3. **Add Products to Sale**
   ```
   ✓ Select a product from "Product" dropdown
   ✓ Enter Quantity in kg (supports decimals like 25.5)
   ✓ Click "Add to Sale"
   ✓ Product appears in "Sale Items" section
   ✓ Repeat for multiple products
   
   Note: Dropdown shows current stock for each product
   ```

### 4. **Apply Discount (Optional)**
   ```
   Option A: Percentage Discount
   - Enter value in "Discount (%)" field
   - Example: 5 = 5% off subtotal
   
   Option B: Flat Amount Discount
   - Enter amount in "Discount Amount (₹)" field
   - Example: 500 = ₹500 off
   
   You can use both simultaneously - they stack
   ```

### 5. **Select Sale Type**
   ```
   Local Sales (CGST/SGST):
   - For sales within same state
   - Tax: 9% CGST + 9% SGST = 18% total
   - Selected by default
   
   Interstate Sales (IGST):
   - For sales across state boundaries
   - Tax: 18% IGST (single tax)
   - Select if selling to another state
   ```

### 6. **Choose Payment Mode**
   ```
   Options:
   - Cash (immediate payment)
   - UPI (digital payment)
   - Card (debit/credit card)
   - Bank Transfer (NEFT/RTGS)
   - Credit (pending payment, tracked as credit)
   
   Optional: Enter Transaction ID/Reference number
   ```

### 7. **Complete the Sale**
   ```
   ✓ Review invoice summary on right panel
   ✓ Verify Grand Total and Profit
   ✓ Check Stock Alerts (shows low/out of stock items)
   ✓ Click "Complete Sale & Generate Invoice"
   
   System will:
   - Generate unique invoice number
   - Deduct stock from inventory
   - Save sale to database
   - Create payment record
   - Update analytics
   ```

## 📊 Understanding the Invoice Summary

The right panel shows real-time calculations:

```
INVOICE SUMMARY
├─ Subtotal: ₹X,XXX.XX
├─ Discount: -₹X,XXX.XX
├─ Subtotal After Discount: ₹X,XXX.XX
├─ CGST (9%): ₹X,XXX.XX
├─ SGST (9%): ₹X,XXX.XX
├─ ────────────────────
├─ Grand Total: ₹X,XXX.XX
├─ Total Profit: ₹X,XXX.XX (green)
└─ Stock Status: ✓ All items in stock
```

## 📑 Viewing Sales Records

### Go to "Sales List" Tab

```
Features:
✓ Table shows all sales records
✓ Columns: Invoice#, Date, Customer, Amount, Profit, Status, Actions
✓ Search box to find by invoice number or customer name
✓ "View" button to see full invoice details
✓ "Delete" button to remove sale (restores stock)
```

### Viewing Invoice Details

```
Click "View" on any sale record to see:
✓ Complete invoice with company letterhead
✓ Customer billing details
✓ Itemized product list
✓ Tax breakdown (CGST/SGST or IGST)
✓ Grand total and payment details
✓ Print and Download PDF options
```

## 📈 Sales Analytics

### Go to "Analytics" Tab

**Summary Cards:**
- **Total Sales:** Sum of all invoice amounts
- **Total Profit:** Combined profit from all sales
- **Total Transactions:** Number of sales
- **Unique Customers:** Count of different customers

**Charts:**
1. **Sales Trend:** Line graph of daily sales
2. **Profit Margin:** Bar graph of daily profit
3. **Customer Type Distribution:** Pie chart (Retail/Wholesale/Distributor)
4. **Product Performance:** Top 5 products by sales value

## 👥 Managing Customers

### Go to "Customers" Tab

```
Features:
✓ Card view of all customers
✓ Shows: Name, Type, Phone, Email, Location, GST, Credit Limit
✓ Color-coded by type
✓ "Add Customer" button to create new
```

## 🖨️ Invoice Operations

### Print Invoice
```
Click "Print Invoice" button in top-right
→ Opens print preview
→ Choose your printer
→ Click "Print"
```

### Download as PDF
```
Click "Download PDF" button in top-right
→ Saves as "Invoice-INV-YYYY-MM-DD-XXXX.pdf"
→ Opens in downloads folder
→ Email to customer or store digitally
```

## ⚠️ Important Notes

### Stock Management
- ✓ Automatically deducted when sale is completed
- ✓ Restored if sale is deleted
- ✓ Low stock warning shown (< 20% of opening stock)
- ✓ Prevents overselling (validates against available stock)

### Tax Calculation
- ✓ Automatic based on sale type
- ✓ Applies to subtotal after discount
- ✓ CGST/SGST for local, IGST for interstate

### Profit Calculation
- Profit = (Unit Price - Cost Price) × Quantity
- Reduced by discount applied
- Shown per item and as total

### Payment Tracking
- ✓ Records payment mode
- ✓ Tracks transaction ID
- ✓ Marks status as "completed" or "pending"
- ✓ Supports credit sales (mark as pending)

## 🔒 Security & Permissions

**What you can do:**
- ✓ Create sales (if assigned "create-sale" permission)
- ✓ View all sales
- ✓ Generate invoices
- ✓ View analytics
- ✓ Manage customers

**What only Admins can do:**
- ✗ Delete sales (requires admin role)
- ✗ Modify system settings
- ✗ Access role management

## 📱 Responsive Design

The module works on:
- ✓ Desktop (1920x1080+)
- ✓ Tablet (iPad, Android tablets)
- ✓ Large mobile devices (landscape orientation)

**Best experience:** Desktop view

## 🐛 Troubleshooting

### Problem: Products not showing in dropdown
**Solution:** 
1. Check that products exist in Inventory module
2. Ensure inventory stock is > 0
3. Refresh the page

### Problem: Sale not being saved
**Solution:**
1. Check console for JavaScript errors (F12)
2. Verify database connection
3. Ensure all required fields are filled
4. Check browser console for API errors

### Problem: Stock not deducting
**Solution:**
1. Verify sale was saved (check Sales List)
2. Check Inventory module to see current stock
3. If not deducted, delete sale and retry

### Problem: Invoice not generating
**Solution:**
1. Ensure sale was successfully created first
2. Click "View" button in Sales List to see invoice
3. Check that customer details are complete

### Problem: PDF not downloading
**Solution:**
1. Disable any popup blockers
2. Check browser download settings
3. Try using "Print" instead (print to PDF option)

## 💡 Tips & Tricks

1. **Quick Customer Switch:** Use dropdown to change customer mid-sale
2. **Bulk Quantities:** Enter decimals (25.5kg) for precise measurements
3. **Fast Discount:** Use percentage for bulk discounts, flat amount for specials
4. **Invoice Naming:** Save PDFs with customer name in filename for easy finding
5. **Profit Analysis:** Check Analytics tab regularly to identify best-selling products
6. **Credit Limits:** Set customer credit limits to prevent over-extending credit
7. **Backup Invoices:** Download and store PDF copies for records

## 🔄 Workflow Example

**Complete workflow for a typical sale:**

```
1. Customer calls: "I want to buy 50kg of Premium Green Tea"
   └─ Click Sales → Sales Module opens

2. Customer details available?
   ├─ YES → Select from dropdown
   └─ NO → Click "Add New Customer" → Fill form → Save

3. Select product: "Premium Green Tea"
   └─ Enter quantity: 50 → Click "Add to Sale"

4. Customer requests 10% discount
   └─ Enter 10 in "Discount (%)" field

5. Payment: "I'll do bank transfer"
   └─ Select "Bank Transfer" → Enter Transaction ID

6. Click "Complete Sale & Generate Invoice"
   └─ Invoice created, stock deducted

7. Customer asks for PDF
   └─ Click "Download PDF" → Email to customer

8. Next day: Check sales performance
   └─ Click "Analytics" → View charts and profits
```

## 📞 Quick Reference

| Feature | Location | Access |
|---------|----------|--------|
| Create Sale | Create Sale Tab | Default tab |
| View Sales | Sales List Tab | Click tab |
| Analytics | Analytics Tab | Click tab |
| Manage Customers | Customers Tab | Click tab |
| Edit Customer | Customers Tab | Click card |
| Print Invoice | After completing sale | Click button |
| Download Invoice | After completing sale | Click button |
| Delete Sale | Sales List Tab | Click Delete |

## 📚 Additional Resources

- Full Documentation: See `SALES_MODULE.md`
- API Documentation: See `API_DOCUMENTATION.md`
- Database Schema: See `database_schema.sql`
- Module Workflows: See `FLOWS.md`

---

**Congratulations! You're now ready to use the Sales Management Module! 🎉**

For more advanced features and detailed documentation, refer to `SALES_MODULE.md`
