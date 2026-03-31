# API Documentation with cURL Commands

## Database Information

**Database Name:** `tea_factory`

**Table Name:** `users`

### Users Table Structure

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    phone VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Available Roles
- `admin`
- `manager`
- `user`

### Sample SQL for Seeding Data

```sql
-- Insert a test admin user (plain password - no hashing)
INSERT INTO users (full_name, email, password_hash, role, phone) 
VALUES (
    'Admin User', 
    'admin@example.com', 
    'password', -- Plain password stored as-is
    'admin', 
    '+1234567890'
);

-- Insert a test manager user
INSERT INTO users (full_name, email, password_hash, role, phone) 
VALUES (
    'Manager User', 
    'manager@example.com', 
    'password', -- Plain password stored as-is
    'manager', 
    '+1234567891'
);

-- Insert a test regular user
INSERT INTO users (full_name, email, password_hash, role, phone) 
VALUES (
    'Regular User', 
    'user@example.com', 
    'password', -- Plain password stored as-is
    'user', 
    '+1234567892'
);
```

**Note:** Passwords are stored as plain text (no encryption) for this simple college project.

---

## API Endpoints

### Base URL
Assuming your API is hosted at: `http://localhost/Bacend/api/`

---

## 1. Login

**Endpoint:** `POST /api/login.php`

**Description:** Authenticate a user and create a session.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost/Bacend/api/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }' \
  -c cookies.txt
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "full_name": "User Name",
        "email": "user@example.com",
        "role": "user",
        "phone": "+1234567890"
    }
}
```

---

## 2. Logout

**Endpoint:** `POST /api/logout.php`

**Description:** Destroy the current session and log out the user.

**Authentication:** Required (session-based)

**cURL Command:**
```bash
curl -X POST http://localhost/Bacend/api/logout.php \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
    "message": "Logged out"
}
```

---

## 3. Get Current Session

**Endpoint:** `GET /api/session.php`

**Description:** Get the current authenticated user from the session.

**Authentication:** Required (session-based)

**cURL Command:**
```bash
curl -X GET http://localhost/Bacend/api/session.php \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "full_name": "User Name",
        "email": "user@example.com",
        "role": "user",
        "phone": "+1234567890"
    }
}
```

---

## 4. Get Profile

**Endpoint:** `GET /api/profile.php`

**Description:** Get the current user's profile information.

**Authentication:** Required (session-based)

**cURL Command:**
```bash
curl -X GET http://localhost/Bacend/api/profile.php \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "full_name": "User Name",
        "email": "user@example.com",
        "role": "user",
        "phone": "+1234567890"
    }
}
```

---

## 5. Update Profile

**Endpoint:** `PUT /api/profile.php`

**Description:** Update the current user's profile (full_name and phone).

**Authentication:** Required (session-based)

**Request Body:**
```json
{
    "full_name": "Updated Name",
    "phone": "+9876543210"
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost/Bacend/api/profile.php \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "full_name": "Updated Name",
    "phone": "+9876543210"
  }'
```

**Response:**
```json
{
    "user": {
        "id": 1,
        "full_name": "Updated Name",
        "email": "user@example.com",
        "role": "user",
        "phone": "+9876543210"
    }
}
```

---

## 6. Change Password

**Endpoint:** `PATCH /api/profile.php`

**Description:** Change the current user's password.

**Authentication:** Required (session-based)

**Request Body:**
```json
{
    "current_password": "oldpassword",
    "new_password": "newpassword"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost/Bacend/api/profile.php \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "current_password": "oldpassword",
    "new_password": "newpassword"
  }'
```

**Response:**
```json
{
    "message": "Password updated"
}
```

---

## 7. Get All Users (Admin Only)

**Endpoint:** `GET /api/users.php`

**Description:** Get a list of all users. Only accessible by admin role.

**Authentication:** Required (session-based)
**Authorization:** Admin role required

**cURL Command:**
```bash
curl -X GET http://localhost/Bacend/api/users.php \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Response:**
```json
{
    "users": [
        {
            "id": 1,
            "full_name": "User One",
            "email": "user1@example.com",
            "role": "user",
            "phone": "+1234567890",
            "created_at": "2024-01-01 12:00:00"
        },
        {
            "id": 2,
            "full_name": "Admin User",
            "email": "admin@example.com",
            "role": "admin",
            "phone": "+1234567891",
            "created_at": "2024-01-01 11:00:00"
        }
    ]
}
```

---

## 8. Create User (Admin Only)

**Endpoint:** `POST /api/users.php`

**Description:** Create a new user. Only accessible by admin role.

**Authentication:** Required (session-based)
**Authorization:** Admin role required

**Request Body:**
```json
{
    "full_name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "phone": "+1234567893"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost/Bacend/api/users.php \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "full_name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "phone": "+1234567893"
  }'
```

**Response:**
```json
{
    "user": {
        "id": 3,
        "full_name": "New User",
        "email": "newuser@example.com",
        "role": "user",
        "phone": "+1234567893"
    }
}
```

---

## 9. Update User Role (Admin Only)

**Endpoint:** `PATCH /api/users.php`

**Description:** Update a user's role. Only accessible by admin role.

**Authentication:** Required (session-based)
**Authorization:** Admin role required

**Request Body:**
```json
{
    "id": 3,
    "role": "manager"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost/Bacend/api/users.php \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "id": 3,
    "role": "manager"
  }'
```

**Response:**
```json
{
    "user": {
        "id": 3,
        "full_name": "New User",
        "email": "newuser@example.com",
        "role": "manager",
        "phone": "+1234567893"
    }
}
```

---

## 10. Get Available Roles

**Endpoint:** `GET /api/roles.php`

**Description:** Get a list of available user roles.

**Authentication:** Required (token-based)

**cURL Command:**
```bash
curl -X GET http://localhost/Bacend/api/roles.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
    "roles": ["admin", "manager", "user"]
}
```

---

## 11. Get All Employees

**Endpoint:** `GET /api/employees.php`

**Description:** Get a list of all employees.

**Authentication:** Required (token-based)

**cURL Command:**
```bash
curl -X GET http://localhost/Bacend/api/employees.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
    "employees": [
        {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "position": "Manager",
            "department": "Production",
            "hire_date": "2024-01-01",
            "salary": "50000.00",
            "status": "active",
            "created_at": "2024-01-01 12:00:00"
        }
    ]
}
```

---

## 12. Create Employee

**Endpoint:** `POST /api/employees.php`

**Description:** Create a new employee.

**Authentication:** Required (token-based)

**Request Body:**
```json
{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "position": "Worker",
    "department": "Production",
    "hire_date": "2024-01-15",
    "salary": "30000.00",
    "status": "active"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost/Bacend/api/employees.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "position": "Worker",
    "department": "Production",
    "hire_date": "2024-01-15",
    "salary": "30000.00",
    "status": "active"
  }'
```

**Response:**
```json
{
    "employee": {
        "id": 2,
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567891",
        "position": "Worker",
        "department": "Production",
        "hire_date": "2024-01-15",
        "salary": "30000.00",
        "status": "active",
        "created_at": "2024-01-15 10:00:00"
    }
}
```

---

## 13. Update Employee

**Endpoint:** `PUT /api/employees.php`

**Description:** Update an existing employee.

**Authentication:** Required (token-based)

**Request Body:**
```json
{
    "id": 2,
    "full_name": "Jane Smith Updated",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "position": "Senior Worker",
    "department": "Production",
    "hire_date": "2024-01-15",
    "salary": "35000.00",
    "status": "active"
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost/Bacend/api/employees.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": 2,
    "full_name": "Jane Smith Updated",
    "email": "jane@example.com",
    "phone": "+1234567891",
    "position": "Senior Worker",
    "department": "Production",
    "hire_date": "2024-01-15",
    "salary": "35000.00",
    "status": "active"
  }'
```

---

## 14. Delete Employee

**Endpoint:** `DELETE /api/employees.php`

**Description:** Delete an employee.

**Authentication:** Required (token-based)

**Request Body:**
```json
{
    "id": 2
}
```

**cURL Command:**
```bash
curl -X DELETE http://localhost/Bacend/api/employees.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": 2
  }'
```

---

## 15. Get Attendance

**Endpoint:** `GET /api/attendance.php`

**Description:** Get attendance records. Can filter by employee_id and date.

**Authentication:** Required (token-based)

**Query Parameters:**
- `employee_id` (optional): Filter by employee ID
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**cURL Command:**
```bash
# Get all attendance records
curl -X GET http://localhost/Bacend/api/attendance.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get attendance for specific employee
curl -X GET "http://localhost/Bacend/api/attendance.php?employee_id=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get attendance for specific date
curl -X GET "http://localhost/Bacend/api/attendance.php?employee_id=1&date=2024-01-15" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
    "attendance": [
        {
            "id": 1,
            "employee_id": 1,
            "attendance_date": "2024-01-15",
            "check_in_time": "09:00:00",
            "check_out_time": "17:00:00",
            "status": "present",
            "notes": "",
            "created_at": "2024-01-15 09:00:00"
        }
    ]
}
```

---

## 16. Create Attendance Record

**Endpoint:** `POST /api/attendance.php`

**Description:** Create a new attendance record.

**Authentication:** Required (token-based)

**Request Body:**
```json
{
    "employee_id": 1,
    "attendance_date": "2024-01-15",
    "check_in_time": "09:00:00",
    "check_out_time": "17:00:00",
    "status": "present",
    "notes": "On time"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost/Bacend/api/attendance.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "employee_id": 1,
    "attendance_date": "2024-01-15",
    "check_in_time": "09:00:00",
    "check_out_time": "17:00:00",
    "status": "present",
    "notes": "On time"
  }'
```

---

## 17. Update Attendance Record

**Endpoint:** `PATCH /api/attendance.php`

**Description:** Update an existing attendance record.

**Authentication:** Required (token-based)

**Request Body:**
```json
{
    "id": 1,
    "check_in_time": "09:15:00",
    "check_out_time": "17:30:00",
    "status": "present",
    "notes": "Late arrival"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost/Bacend/api/attendance.php \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": 1,
    "check_in_time": "09:15:00",
    "check_out_time": "17:30:00",
    "status": "present",
    "notes": "Late arrival"
  }'
```

---

## Additional Database Tables

### Employees Table

```sql
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NULL,
    hire_date DATE NOT NULL,
    salary DECIMAL(10, 2) NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Attendance Table

```sql
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
```

### Sample Data for Employees

```sql
INSERT INTO employees (full_name, email, phone, position, department, hire_date, salary, status) 
VALUES 
    ('John Doe', 'john@example.com', '+1234567890', 'Manager', 'Production', '2024-01-01', 50000.00, 'active'),
    ('Jane Smith', 'jane@example.com', '+1234567891', 'Worker', 'Production', '2024-01-15', 30000.00, 'active');
```

### Sample Data for Attendance

```sql
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, notes) 
VALUES 
    (1, '2024-01-15', '09:00:00', '17:00:00', 'present', 'On time'),
    (2, '2024-01-15', '09:05:00', '17:05:00', 'present', 'Slightly late');
```

---

## Notes

1. **Session Management:** The APIs use PHP sessions. Make sure to use the `-c cookies.txt` flag when logging in to save cookies, and `-b cookies.txt` for subsequent requests to maintain the session.

2. **Base URL:** Update the base URL in all curl commands if your API is hosted at a different location.

3. **Password Storage:** Passwords are stored as plain text (no encryption) for this simple college project.

4. **Error Responses:** All endpoints return JSON error responses with appropriate HTTP status codes:
   - `401` - Unauthenticated
   - `403` - Forbidden (insufficient permissions)
   - `405` - Method not allowed
   - `422` - Validation error
   - `409` - Conflict (e.g., email already exists)

5. **Testing Workflow:**
   ```bash
   # 1. Login first and save the token
   curl -X POST http://localhost/Bacend/api/login.php \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   
   # Response will include a token:
   # {"user": {...}, "token": "YOUR_TOKEN_HERE"}
   
   # 2. Use the token for authenticated requests
   curl -X GET http://localhost/Bacend/api/profile.php \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

6. **Database Setup:** Run the SQL queries from `database_schema.sql` to create all necessary tables.

