# Sales Management Module - API Reference

## Base URL
```
http://localhost/Bacend/api/
```

---

## Customers API

### Get All Customers
**Endpoint:** `GET /customers.php`

**Description:** Retrieve list of all active customers

**Response:**
```json
{
  "customers": [
    {
      "customer_id": 1,
      "customer_name": "ABC Trading Company",
      "customer_type": "Wholesale",
      "phone": "+91-9876543210",
      "email": "abc@trading.com",
      "address": "123 Market Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "gst_number": "29AAACT1234A1Z0",
      "credit_limit": 50000,
      "status": "active",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ]
}
```

---

### Get Customer by Type
**Endpoint:** `GET /customers.php?type=Wholesale`

**Parameters:**
- `type` (optional): Filter by customer type (Retail, Wholesale, Distributor)

**Response:** Same as above, filtered results

---

### Get Single Customer
**Endpoint:** `GET /customers.php?id=1`

**Parameters:**
- `id` (required): Customer ID

**Response:**
```json
{
  "customer": {
    "customer_id": 1,
    "customer_name": "ABC Trading Company",
    ...
  }
}
```

---

### Create Customer
**Endpoint:** `POST /customers.php`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_name": "New Customer Ltd",
  "customer_type": "Wholesale",
  "phone": "+91-9999999999",
  "email": "info@newcustomer.com",
  "address": "456 Business Park",
  "city": "Delhi",
  "state": "Delhi",
  "pincode": "110001",
  "gst_number": "07AAACT1234D1Z8",
  "credit_limit": 75000
}
```

**Required Fields:**
- `customer_name` (string)
- `customer_type` (string: Retail, Wholesale, Distributor)
- `phone` (string)

**Optional Fields:**
- `email`, `address`, `city`, `state`, `pincode`, `gst_number`, `credit_limit`

**Response (201):**
```json
{
  "customer": {
    "customer_id": 6,
    "customer_name": "New Customer Ltd",
    ...
  }
}
```

**Error Responses:**
- `422`: Missing required field
- `409`: Customer already exists or duplicate GST number
- `500`: Server error

---

### Update Customer
**Endpoint:** `PUT /customers.php`

**Request Body:**
```json
{
  "id": 1,
  "customer_name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "+91-9999999999",
  "address": "New Address",
  "status": "active",
  "credit_limit": 100000
}
```

**Response:**
```json
{
  "customer": {
    "customer_id": 1,
    ...
  }
}
```

**Error Responses:**
- `422`: No fields to update
- `404`: Customer not found
- `500`: Server error

---

## Inventory/Products API

### Get All Products
**Endpoint:** `GET /inventory.php`

**Description:** Retrieve all products from inventory

**Response:**
```json
{
  "inventory": [
    {
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "packing_date": "2024-02-08",
      "expired_date": "2025-02-08",
      "tea_type": "Green tea",
      "grade": "OP",
      "storage_condition": "cool",
      "temperature": 22.5,
      "storage_location": "Warehouse A, Shelf 1",
      "opening_stock_kg": 100,
      "current_stock_kg": 95.5,
      "damaged_stock_kg": 2,
      "total_stock_value": 50000,
      "selling_price": 500,
      "cost_per_kg": 400,
      "used_in": "Production Batch #101",
      "remarks": "High quality premium tea",
      "created_at": "2024-02-08T10:00:00"
    }
  ]
}
```

---

### Get Products by Tea Type
**Endpoint:** `GET /inventory.php?tea_type=Green%20tea`

**Parameters:**
- `tea_type` (optional): Green tea, black tea, herbal tea, plucked tea

---

### Get Products by Grade
**Endpoint:** `GET /inventory.php?grade=OP`

**Parameters:**
- `grade` (optional): OP, BOP, FBOP, etc.

---

## Sales API

### Get All Sales
**Endpoint:** `GET /sales.php` or `GET /sales.php?action=list`

**Description:** Retrieve all completed sales

**Response:**
```json
{
  "sales": [
    {
      "sale_id": 1,
      "invoice_number": "INV-20260308-0001",
      "customer_id": 1,
      "customer_name": "ABC Trading Company",
      "customer_type": "Wholesale",
      "sale_date": "2026-03-08",
      "sale_time": "14:30:00",
      "subtotal": 5000,
      "discount_amount": 500,
      "discount_percentage": 10,
      "cgst_amount": 405,
      "sgst_amount": 405,
      "igst_amount": 0,
      "total_tax": 810,
      "grand_total": 5310,
      "total_profit": 2310,
      "payment_mode": "Cash",
      "payment_status": "completed",
      "status": "completed",
      "item_count": 3,
      "created_at": "2026-03-08T14:30:00"
    }
  ]
}
```

---

### Get Single Sale with Items
**Endpoint:** `GET /sales.php?action=view&id=1`

**Parameters:**
- `id` (required): Sale ID

**Response:**
```json
{
  "sale": { ...sale details... },
  "items": [
    {
      "item_id": 1,
      "sale_id": 1,
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity_sold": 10,
      "unit_price": 500,
      "cost_price": 400,
      "line_discount_amount": 0,
      "line_subtotal": 5000,
      "line_profit": 1000,
      "created_at": "2026-03-08T14:30:00"
    }
  ],
  "payments": [...]
}
```

---

### Get Invoice Data
**Endpoint:** `GET /sales.php?action=invoice&id=1`

**Parameters:**
- `id` (required): Sale ID

**Response:**
```json
{
  "sale": { ...complete sale details... },
  "items": [...],
  "company": {
    "factory_name": "Tea Factory",
    "address": "123 Factory Lane",
    "gst_number": "29AAACT0000Z1Z5"
  }
}
```

---

### Create Sale
**Endpoint:** `POST /sales.php`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "create",
  "customer_id": 1,
  "sale_date": "2026-03-08",
  "sale_time": "14:30:00",
  "items": [
    {
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity": 10,
      "unit_price": 500,
      "cost_price": 400,
      "discount": 0
    },
    {
      "inventory_id": 2,
      "product_name": "Classic Black Tea",
      "product_code": "BT-002",
      "quantity": 5,
      "unit_price": 450,
      "cost_price": 350,
      "discount": 0
    }
  ],
  "discount_amount": 500,
  "tax_rate": 18,
  "is_interstate": false,
  "payment_mode": "Cash",
  "payment_status": "completed",
  "transaction_id": null
}
```

**Required Fields:**
- `action`: "create"
- `customer_id` (integer)
- `sale_date` (YYYY-MM-DD format)
- `items` (array, minimum 1 item)

**Item Fields:**
- `inventory_id` (integer)
- `product_name` (string)
- `product_code` (string)
- `quantity` (float)
- `unit_price` (float)
- `cost_price` (float)
- `discount` (float, default 0)

**Optional Fields:**
- `sale_time` (HH:MM:SS format, defaults to current time)
- `discount_amount` (float, default 0)
- `tax_rate` (float, default 9)
- `is_interstate` (boolean, default false)
- `payment_mode` (string, default 'Cash')
- `payment_status` (string, default 'pending')
- `transaction_id` (string, optional)

**Response (201):**
```json
{
  "message": "Sale created successfully",
  "sale_id": 1,
  "invoice_number": "INV-20260308-0001",
  "grand_total": 9610
}
```

**Error Responses:**
- `422`: Missing required field or invalid data
- `404`: Customer not found
- `500`: Server error

---

### Update Sale Payment Status
**Endpoint:** `PUT /sales.php`

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

### Delete Sale
**Endpoint:** `DELETE /sales.php`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <admin_token>
```

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

**Note:** Only admin users can delete sales. Stock is automatically restored.

**Error Responses:**
- `403`: Unauthorized (non-admin user)
- `404`: Sale not found
- `422`: ID required
- `500`: Server error

---

### Get Analytics
**Endpoint:** `GET /sales.php?action=analytics&period=daily&start_date=2026-03-01&end_date=2026-03-31`

**Parameters:**
- `period` (optional): daily, monthly, yearly (default: daily)
- `start_date` (optional): YYYY-MM-DD format (default: first of current month)
- `end_date` (optional): YYYY-MM-DD format (default: today)

**Response:**
```json
{
  "analytics": [
    {
      "analytics_id": 1,
      "analytics_date": "2026-03-08",
      "period_type": "daily",
      "total_sales_count": 5,
      "total_sales_amount": 25000,
      "total_profit": 10000,
      "total_tax": 4500,
      "total_discount": 1000,
      "avg_order_value": 5000,
      "customer_count": 3,
      "items_sold": 25,
      "created_at": "2026-03-08T14:35:00"
    }
  ]
}
```

---

## Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request format |
| 403 | Forbidden | Unauthorized access |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Internal server error |

---

## Request/Response Headers

### Standard Headers (All Requests)
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token> (if required)
```

### Response Headers
```
Content-Type: application/json; charset=UTF-8
```

---

## Rate Limiting
No rate limiting currently implemented. Recommended limits:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Authentication
All endpoints require authentication. User must be logged in to access APIs.

**Authentication Method:** Session-based (via `ensure_authenticated()`)

**Required User Roles:**
- GET endpoints: User, Manager, Admin
- POST/PUT endpoints: Manager, Admin
- DELETE endpoints: Admin only

---

## Data Types

### Customer Types
- `Retail`
- `Wholesale`
- `Distributor`

### Payment Modes
- `Cash`
- `UPI`
- `Card`
- `Bank Transfer`
- `Credit`

### Payment Status
- `pending` - Not yet paid
- `completed` - Fully paid
- `partial` - Partially paid
- `failed` - Payment failed

### Sale Status
- `completed` - Sale completed
- `cancelled` - Sale cancelled
- `pending` - Pending completion

### Tax Types
- Local: CGST (9%) + SGST (9%) = 18% total
- Interstate: IGST (18%) = 18% total

---

## Example CURL Requests

### Get All Customers
```bash
curl -X GET "http://localhost/Bacend/api/customers.php" \
  -H "Content-Type: application/json" \
  -b "session_id=xxxxx"
```

### Create A Sale
```bash
curl -X POST "http://localhost/Bacend/api/sales.php" \
  -H "Content-Type: application/json" \
  -b "session_id=xxxxx" \
  -d '{
    "action": "create",
    "customer_id": 1,
    "sale_date": "2026-03-08",
    "items": [{
      "inventory_id": 1,
      "product_name": "Premium Green Tea",
      "product_code": "GT-001",
      "quantity": 10,
      "unit_price": 500,
      "cost_price": 400,
      "discount": 0
    }],
    "discount_amount": 0,
    "payment_mode": "Cash",
    "payment_status": "completed"
  }'
```

### Get Single Sale
```bash
curl -X GET "http://localhost/Bacend/api/sales.php?action=view&id=1" \
  -H "Content-Type: application/json" \
  -b "session_id=xxxxx"
```

---

## Webhooks (Future)
Not currently implemented. Recommended webhooks:
- `sale.created` - When new sale is created
- `sale.deleted` - When sale is deleted
- `customer.added` - When new customer added
- `stock.low` - When stock falls below threshold

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Mar 2026 | Initial release |

---

**Last Updated:** March 8, 2026
**Status:** Production Ready
