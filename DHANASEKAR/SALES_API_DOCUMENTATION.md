# API Documentation for Sales Module

## SALES MANAGEMENT API

### Base URL: `/api/sales.php`
**Authentication:** Required
**Endpoint Type:** RESTful

---

### 1. Get All Sales

**Endpoint:** `GET /api/sales.php?action=list`

**Description:** Retrieve all sales records with customer information

**Response:**
```json
{
  "sales": [
    {
      "sale_id": 1,
      "invoice_number": "INV-2026-02-04-0001",
      "customer_id": 1,
      "customer_name": "Fresh Mart Retail",
      "customer_type": "Retail",
      "sale_date": "2026-02-04",
      "sale_time": "10:30:00",
      "subtotal": 50000.00,
      "discount_amount": 2500.00,
      "discount_percentage": 5.00,
      "cgst_amount": 2137.50,
      "sgst_amount": 2137.50,
      "igst_amount": 0,
      "total_tax": 4275.00,
      "grand_total": 51775.00,
      "total_profit": 15000.00,
      "payment_mode": "Cash",
      "payment_status": "completed",
      "item_count": 2,
      "created_at": "2026-02-04 10:30:00"
    }
  ]
}
```

---

### 2. Get Single Sale with Details

**Endpoint:** `GET /api/sales.php?action=view&id={sale_id}`

**Parameters:**
- `action` (string): "view"
- `id` (integer): Sale ID

**Response:**
```json
{
  "sale": {
    "sale_id": 1,
    "invoice_number": "INV-2026-02-04-0001",
    "customer_id": 1,
    "customer_name": "Fresh Mart Retail",
    "customer_type": "Retail",
    "email": "freshmart@example.com",
    "phone": "+919876543210",
    "gst_number": "29AAAAA0000A1Z5",
    "address": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "subtotal": 50000.00,
    "discount_amount": 2500.00,
    "grand_total": 51775.00,
    "total_profit": 15000.00,
    "payment_mode": "Cash",
    "payment_status": "completed"
  },
  "items": [
    {
      "item_id": 1,
      "sale_id": 1,
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity_sold": 25.00,
      "unit_price": 500.00,
      "cost_price": 400.00,
      "line_discount_amount": 625.00,
      "line_subtotal": 12375.00,
      "line_profit": 2500.00
    }
  ],
  "payments": [
    {
      "payment_id": 1,
      "sale_id": 1,
      "payment_amount": 51775.00,
      "payment_date": "2026-02-04",
      "payment_time": "10:45:00",
      "payment_mode": "Cash",
      "transaction_id": "CASH-001",
      "payment_status": "completed"
    }
  ]
}
```

---

### 3. Get Sales Analytics

**Endpoint:** `GET /api/sales.php?action=analytics&period={period}&start_date={date}&end_date={date}`

**Parameters:**
- `action` (string): "analytics"
- `period` (string): "daily", "monthly", or "yearly"
- `start_date` (string): Start date (YYYY-MM-DD)
- `end_date` (string): End date (YYYY-MM-DD)

**Response:**
```json
{
  "analytics": [
    {
      "analytics_id": 1,
      "analytics_date": "2026-02-04",
      "period_type": "daily",
      "total_sales_count": 1,
      "total_sales_amount": 104500.00,
      "total_profit": 30000.00,
      "total_tax": 9500.00,
      "total_discount": 5000.00,
      "avg_order_value": 104500.00,
      "customer_count": 1,
      "items_sold": 175.00
    }
  ]
}
```

---

### 4. Get Invoice Details (for Printing/PDF)

**Endpoint:** `GET /api/sales.php?action=invoice&id={sale_id}`

**Parameters:**
- `action` (string): "invoice"
- `id` (integer): Sale ID

**Response:**
```json
{
  "sale": {
    "sale_id": 1,
    "invoice_number": "INV-2026-02-04-0001",
    "customer_name": "Fresh Mart Retail",
    "customer_type": "Retail",
    "address": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "gst_number": "29AAAAA0000A1Z5",
    "sale_date": "2026-02-04",
    "subtotal": 50000.00,
    "discount_amount": 2500.00,
    "cgst_amount": 2137.50,
    "sgst_amount": 2137.50,
    "igst_amount": 0,
    "grand_total": 51775.00,
    "total_profit": 15000.00,
    "payment_mode": "Cash",
    "payment_status": "completed"
  },
  "items": [
    {
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity_sold": 25.00,
      "unit_price": 500.00,
      "line_subtotal": 12375.00
    }
  ],
  "company": {
    "factory_name": "My Tea Factory",
    "address": "123 Estate Road, Ooty",
    "gst_number": "33AAAAA0000A1Z5",
    "contact": "9876543210",
    "email": "info@teafactory.com"
  }
}
```

---

### 5. Create Sale

**Endpoint:** `POST /api/sales.php`

**Request Body:**
```json
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
      "unit_price": 500.00,
      "cost_price": 400.00,
      "discount": 100.00
    }
  ],
  "discount_amount": 0,
  "discount_percentage": 5,
  "tax_rate": 18,
  "is_interstate": false,
  "payment_mode": "Cash",
  "payment_status": "completed",
  "transaction_id": "TXN-2026-001"
}
```

**Response (Success):**
```json
{
  "message": "Sale created successfully",
  "sale_id": 1,
  "invoice_number": "INV-2026-02-04-0001",
  "grand_total": 51775.00
}
```

**Response (Error):**
```json
{
  "error": "Customer not found"
}
```

**Status Codes:**
- 201: Sale created successfully
- 422: Missing required fields or validation error
- 404: Customer not found
- 500: Server error

---

### 6. Update Sale Payment Status

**Endpoint:** `PUT /api/sales.php`

**Request Body:**
```json
{
  "id": 1,
  "payment_status": "completed"
}
```

**Response:**
```json
{
  "message": "Sale updated successfully"
}
```

---

### 7. Delete Sale (Admin Only)

**Endpoint:** `DELETE /api/sales.php`

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "message": "Sale deleted successfully"
}
```

**Note:** Deleting a sale automatically:
- Restores inventory stock
- Deletes associated sales items
- Deletes associated payments
- Updates analytics

---

## CUSTOMERS API

### Base URL: `/api/customers.php`
**Authentication:** Required
**Endpoint Type:** RESTful

---

### 1. Get All Customers

**Endpoint:** `GET /api/customers.php`

**Query Parameters (Optional):**
- `type`: Filter by customer type (Retail, Wholesale, Distributor)

**Response:**
```json
{
  "customers": [
    {
      "customer_id": 1,
      "customer_name": "Fresh Mart Retail",
      "customer_type": "Retail",
      "email": "freshmart@example.com",
      "phone": "+919876543210",
      "address": "123 Main Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "gst_number": "29AAAAA0000A1Z5",
      "credit_limit": 50000.00,
      "status": "active",
      "created_at": "2026-02-04 10:00:00"
    }
  ]
}
```

---

### 2. Get Single Customer

**Endpoint:** `GET /api/customers.php?id={customer_id}`

**Parameters:**
- `id` (integer): Customer ID

**Response:**
```json
{
  "customer": {
    "customer_id": 1,
    "customer_name": "Fresh Mart Retail",
    "customer_type": "Retail",
    "email": "freshmart@example.com",
    "phone": "+919876543210",
    "address": "123 Main Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "gst_number": "29AAAAA0000A1Z5",
    "credit_limit": 50000.00,
    "status": "active"
  }
}
```

---

### 3. Create Customer

**Endpoint:** `POST /api/customers.php`

**Request Body:**
```json
{
  "customer_name": "ABC Retail Store",
  "customer_type": "Retail",
  "phone": "+919876543210",
  "email": "abc@example.com",
  "gst_number": "29AAAAA0000A1Z5",
  "credit_limit": 50000.00,
  "address": "123 Main Street",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001"
}
```

**Response (Success):**
```json
{
  "customer": {
    "customer_id": 5,
    "customer_name": "ABC Retail Store",
    "customer_type": "Retail",
    "phone": "+919876543210",
    "email": "abc@example.com",
    "gst_number": "29AAAAA0000A1Z5",
    "credit_limit": 50000.00,
    "status": "active"
  }
}
```

**Status Codes:**
- 201: Customer created
- 409: Duplicate customer or GST number
- 422: Missing required fields
- 500: Server error

---

### 4. Update Customer

**Endpoint:** `PUT /api/customers.php`

**Request Body:**
```json
{
  "id": 1,
  "customer_name": "New Name",
  "email": "newemail@example.com",
  "phone": "+919999999999",
  "status": "inactive"
}
```

**Response:**
```json
{
  "customer": {
    "customer_id": 1,
    "customer_name": "New Name",
    "customer_type": "Retail",
    "phone": "+919999999999",
    "email": "newemail@example.com",
    "status": "inactive"
  }
}
```

---

## cURL Examples for Sales Module

### Create a Sale
```bash
curl -X POST http://localhost/Bacend/api/sales.php \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "customer_id": 1,
    "sale_date": "2026-02-04",
    "items": [
      {
        "inventory_id": 1,
        "product_name": "Premium Green Tea",
        "product_code": "GT-001",
        "quantity": 25.5,
        "unit_price": 500,
        "cost_price": 400,
        "discount": 0
      }
    ],
    "discount_amount": 0,
    "discount_percentage": 5,
    "is_interstate": false,
    "payment_mode": "Cash",
    "payment_status": "completed"
  }'
```

### Get All Sales
```bash
curl -X GET http://localhost/Bacend/api/sales.php?action=list \
  -H "Content-Type: application/json"
```

### View Invoice
```bash
curl -X GET "http://localhost/Bacend/api/sales.php?action=invoice&id=1" \
  -H "Content-Type: application/json"
```

### Get Sales Analytics
```bash
curl -X GET "http://localhost/Bacend/api/sales.php?action=analytics&period=daily&start_date=2026-02-01&end_date=2026-02-04" \
  -H "Content-Type: application/json"
```

### Create Customer
```bash
curl -X POST http://localhost/Bacend/api/customers.php \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "New Store",
    "customer_type": "Retail",
    "phone": "+919876543210",
    "email": "store@example.com",
    "gst_number": "29AAAAA0000A1Z5",
    "credit_limit": 50000,
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001"
  }'
```

### Delete Sale
```bash
curl -X DELETE http://localhost/Bacend/api/sales.php \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```
