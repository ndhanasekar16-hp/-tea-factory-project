# MODULES.md

## Project Overview

Production Management System for a tea factory that manages employees, tracks attendance, and provides role-based access control. The system consists of a PHP backend with RESTful APIs and a vanilla JavaScript frontend, using MySQL for data persistence.

## Module List

### 1. Authentication & Authorization Module

**Description:** Handles user authentication, session management, and role-based access control for securing the application.

**Responsibilities:**
- User login and logout operations
- Session creation and validation
- Token generation and verification (Bearer token support)
- Role-based authorization (admin, manager, user)
- Password management (plain text storage for demo purposes)
- Session timeout handling

**Key Components:**
- `api/login.php` - Login endpoint
- `api/logout.php` - Logout endpoint
- `api/session.php` - Session validation endpoint
- `lib/AuthService.php` - Authentication service class
- `config.php` - Authentication helpers (`ensure_authenticated()`, `ensure_role()`)
- Frontend: `FE/app.js` - Login/logout handlers, session management

**Database Tables:**
- `users` (id, email, password_hash, role)

---

### 2. User Management Module

**Description:** Manages system users (administrators, managers, regular users) with profile management capabilities.

**Responsibilities:**
- User registration (admin-only)
- User profile retrieval and updates
- Password change functionality
- Role assignment and updates (admin-only)
- User listing and management
- Available roles retrieval

**Key Components:**
- `api/users.php` - User CRUD operations (admin-only)
- `api/profile.php` - Profile management (GET, PUT, PATCH)
- `api/roles.php` - Available roles endpoint
- `lib/UserRepository.php` - User data access layer
- `lib/AuthService.php` - User registration and profile updates

**Database Tables:**
- `users` (id, full_name, email, password_hash, role, phone, created_at)

---

### 3. Employee Management Module

**Description:** Manages factory employees including their personal information, positions, departments, and employment details.

**Responsibilities:**
- Employee creation, reading, updating, and deletion
- Employee listing with filtering and search
- Employee status management (active, inactive, on_leave)
- Salary and department tracking
- Hire date and position management
- Email uniqueness validation

**Key Components:**
- `api/employees.php` - Employee CRUD endpoints (GET, POST, PUT, DELETE)
- Frontend: `FE/employees.html` - Employee listing page
- Frontend: `FE/employees.js` - Employee management UI logic
- Frontend: `FE/new-employee.html` - Employee creation form
- Frontend: `FE/employee-form.js` - Employee form handling

**Database Tables:**
- `employees` (id, full_name, email, phone, position, department, hire_date, salary, status, created_at, updated_at)

---

### 4. Attendance Management Module

**Description:** Tracks employee attendance records including check-in/check-out times, status, and notes.

**Responsibilities:**
- Attendance record creation and updates
- Attendance querying by employee ID and/or date
- Attendance status tracking (present, absent)
- Check-in and check-out time recording
- Attendance notes management
- Bulk attendance marking for multiple employees
- Duplicate attendance prevention (unique constraint per employee per date)

**Key Components:**
- `api/attendance.php` - Attendance CRUD endpoints (GET, POST, PATCH)
- Frontend: `FE/attendance.html` - Attendance viewing page
- Frontend: `FE/attendance.js` - Attendance display and filtering
- Frontend: `FE/mark-attendance.html` - Attendance marking interface
- Frontend: `FE/mark-attendance.js` - Attendance marking logic

**Database Tables:**
- `attendance` (id, employee_id, attendance_date, check_in_time, check_out_time, status, notes, created_at, updated_at)
- Foreign key: `employee_id` references `employees(id)`

---

### 5. Database Access Module

**Description:** Provides centralized database connection management and common database utilities.

**Responsibilities:**
- PDO connection pooling and lazy initialization
- Database configuration management
- Connection error handling
- Query execution helpers

**Key Components:**
- `config.php` - Database connection function `db()`, configuration constants (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)
- `database_schema.sql` - Database schema and seed data

**Database:**
- MySQL database: `tea_factory`

---

### 6. API Service Layer Module

**Description:** Provides RESTful API endpoints with JSON responses, request validation, and error handling.

**Responsibilities:**
- HTTP method routing (GET, POST, PUT, PATCH, DELETE)
- JSON request/response handling
- Input validation and sanitization
- Error response formatting
- HTTP status code management
- Authentication middleware integration

**Key Components:**
- `config.php` - Helper functions (`json_response()`, `get_json_body()`)
- All files in `api/` directory - Individual endpoint handlers
- Error logging via `error_log()`

**API Endpoints:**
- Authentication: `/api/login.php`, `/api/logout.php`, `/api/session.php`
- Users: `/api/users.php`, `/api/profile.php`, `/api/roles.php`
- Employees: `/api/employees.php`
- Attendance: `/api/attendance.php`

---

### 7. Frontend UI Module

**Description:** Provides user interface for all system operations with responsive design and client-side validation.

**Responsibilities:**
- Login and registration forms
- Dashboard with statistics and navigation
- Employee management interface (list, create, edit, delete)
- Attendance viewing and marking interfaces
- Form validation and error handling
- API communication and token management
- Local storage for session persistence
- UI state management and navigation

**Key Components:**
- `FE/index.html` - Login, registration, and dashboard
- `FE/app.js` - Main application logic, authentication, dashboard
- `FE/employees.html` - Employee listing page
- `FE/employees.js` - Employee management UI
- `FE/attendance.html` - Attendance viewing page
- `FE/attendance.js` - Attendance display logic
- `FE/mark-attendance.html` - Attendance marking page
- `FE/mark-attendance.js` - Attendance marking UI
- `FE/new-employee.html` - Employee creation form
- `FE/employee-form.js` - Employee form handler
- `FE/styles.css` - Global styles
- `FE/attendance.css`, `FE/employee-form.css` - Feature-specific styles

**UI Features:**
- Responsive design with Tailwind CSS
- Font Awesome icons
- Form validation
- Loading states
- Error/success messaging
- Search and filtering capabilities

---

### 8. Configuration & Utilities Module

**Description:** Provides system-wide configuration, helper functions, and initialization scripts.

**Responsibilities:**
- Database configuration
- Session initialization
- Global helper functions
- API base URL configuration
- Seed data scripts

**Key Components:**
- `config.php` - Global configuration, database connection, helper functions
- `scripts/seed_admin.php` - Admin user seeding script
- `API_DOCUMENTATION.md` - API documentation

---

### 9. Error Handling & Logging Module

**Description:** Standardizes error responses, HTTP status codes, and logging behavior across all APIs and frontend flows.

**Responsibilities:**
- Centralized JSON error response formatting
- Consistent use of HTTP status codes (`401`, `403`, `405`, `409`, `422`, `500`)
- Validation error handling for API inputs
- Authentication and authorization error handling
- Server-side error logging for debugging

**Key Components:**
- `config.php` - `json_response()` helper for success/error payloads and status codes
- All `api/*.php` files - Use of `http_response_code()`, validation checks, and early returns on error
- PHP `error_log()` - Capturing unexpected server-side issues
- `API_DOCUMENTATION.md` - Documented error status codes and example responses

---

## Module Interaction Summary

- **Authentication Module** validates all API requests and provides user context to other modules
- **User Management Module** uses **Authentication Module** for authorization checks (admin-only operations)
- **Employee Management Module** requires authentication and is accessed by authenticated users
- **Attendance Management Module** depends on **Employee Management Module** (foreign key relationship) and requires authentication
- **API Service Layer Module** wraps all backend modules and handles HTTP communication
- **Frontend UI Module** communicates with **API Service Layer Module** via REST endpoints
- **Database Access Module** is used by all backend modules for data persistence
- **Configuration & Utilities Module** provides shared infrastructure for all modules
- All modules use **Database Access Module** through `config.php` for database operations
- Frontend modules use localStorage for token persistence and session management

