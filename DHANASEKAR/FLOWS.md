# FLOWS.md

## Overall System Flow

High-level flow showing how users interact with the system from initial access through data persistence.

```mermaid
flowchart TD
    A[User Accesses Application] --> B{Has Valid Session?}
    B -->|No| C[Show Login Page]
    B -->|Yes| D[Load Dashboard]
    C --> E[User Enters Credentials]
    E --> F[POST /api/login.php]
    F --> G{Valid Credentials?}
    G -->|No| H[Return Error]
    G -->|Yes| I[Create Session & Token]
    I --> J[Store Token in localStorage]
    J --> D
    D --> K{User Action}
    K -->|Manage Employees| L[Employee Module]
    K -->|Mark Attendance| M[Attendance Module]
    K -->|Manage Users| N[User Module]
    K -->|View Profile| O[Profile Module]
    L --> P[API Request with Auth Token]
    M --> P
    N --> P
    O --> P
    P --> Q{Authenticated?}
    Q -->|No| R[Return 401 Unauthorized]
    Q -->|Yes| S{Authorized Role?}
    S -->|No| T[Return 403 Forbidden]
    S -->|Yes| U[Process Request]
    U --> V[Database Operation]
    V --> W[Return JSON Response]
    W --> X[Update UI]
    H --> C
    R --> C
    T --> D
```

---

## 1. Authentication & Authorization Module Flow

Handles user login, logout, session validation, and role-based access control.

```mermaid
flowchart TD
    A[User Submits Login Form] --> B[Validate Email & Password Format]
    B --> C{Valid Format?}
    C -->|No| D[Show Validation Error]
    C -->|Yes| E[POST /api/login.php]
    E --> F[AuthService.login]
    F --> G[UserRepository.findByEmail]
    G --> H{User Exists?}
    H -->|No| I[Return Invalid Credentials]
    H -->|Yes| J{Password Matches?}
    J -->|No| I
    J -->|Yes| K[set_session_user]
    K --> L[Generate Bearer Token]
    L --> M[Return User + Token]
    M --> N[Store Token in localStorage]
    N --> O[Redirect to Dashboard]
    I --> A
    
    P[API Request Received] --> Q[Check Authorization Header]
    Q --> R{Token Present?}
    R -->|No| S[Check Session]
    R -->|Yes| T[Decode Token]
    T --> U[Verify User in Database]
    U --> V{Valid User?}
    V -->|No| W[Return 401]
    V -->|Yes| X[Set User Context]
    S --> Y{Session Exists?}
    Y -->|No| W
    Y -->|Yes| X
    X --> Z{Check Role Required}
    Z --> AA{Has Required Role?}
    AA -->|No| AB[Return 403]
    AA -->|Yes| AC[Allow Request]
    
    AD[User Clicks Logout] --> AE[POST /api/logout.php]
    AE --> AF[Destroy Session]
    AF --> AG[Clear localStorage]
    AG --> AH[Redirect to Login]
```

---

## 2. User Management Module Flow

Manages system users including registration, profile updates, and role management (admin-only operations).

```mermaid
flowchart TD
    A[User Management Request] --> B{Request Type}
    
    B -->|GET /api/users.php| C[ensure_role admin]
    C --> D{Is Admin?}
    D -->|No| E[Return 403]
    D -->|Yes| F[UserRepository.all]
    F --> G[Query All Users]
    G --> H[Return Users List]
    
    B -->|POST /api/users.php| I[ensure_role admin]
    I --> J{Is Admin?}
    J -->|No| E
    J -->|Yes| K[Validate Required Fields]
    K --> L{Valid?}
    L -->|No| M[Return 422]
    L -->|Yes| N[AuthService.register]
    N --> O[Check Email Exists]
    O --> P{Email Exists?}
    P -->|Yes| Q[Return 409 Conflict]
    P -->|No| R[UserRepository.create]
    R --> S[Insert into users table]
    S --> T[Return Created User]
    
    B -->|PATCH /api/users.php| U[ensure_role admin]
    U --> V{Is Admin?}
    V -->|No| E
    V -->|Yes| W[Validate User ID & Role]
    W --> X{Valid?}
    X -->|No| M
    X -->|Yes| Y[UserRepository.updateRole]
    Y --> Z[Update users.role]
    Z --> AA[Return Updated User]
    
    B -->|GET /api/profile.php| AB[ensure_authenticated]
    AB --> AC{Authenticated?}
    AC -->|No| AD[Return 401]
    AC -->|Yes| AE[Return Current User]
    
    B -->|PUT /api/profile.php| AF[ensure_authenticated]
    AF --> AG{Authenticated?}
    AG -->|No| AD
    AG -->|Yes| AH[Validate full_name]
    AH --> AI{Valid?}
    AI -->|No| M
    AI -->|Yes| AJ[AuthService.updateProfile]
    AJ --> AK[UserRepository.updateProfile]
    AK --> AL[Update users table]
    AL --> AM[Update Session]
    AM --> AN[Return Updated User]
    
    B -->|PATCH /api/profile.php| AO[ensure_authenticated]
    AO --> AP{Authenticated?}
    AP -->|No| AD
    AP -->|Yes| AQ[Validate Passwords]
    AQ --> AR{Valid?}
    AR -->|No| M
    AR -->|Yes| AS[AuthService.updatePassword]
    AS --> AT[Verify Current Password]
    AT --> AU{Matches?}
    AU -->|No| AV[Return 422]
    AU -->|Yes| AW[UserRepository.updatePassword]
    AW --> AX[Update password_hash]
    AX --> AY[Return Success]
    
    B -->|GET /api/roles.php| AZ[ensure_authenticated]
    AZ --> BA{Authenticated?}
    BA -->|No| AD
    BA -->|Yes| BB[Return Available Roles]
```

---

## 3. Employee Management Module Flow

Handles employee CRUD operations including creation, listing, updating, and deletion.

```mermaid
flowchart TD
    A[Employee Management Request] --> B{Request Type}
    
    B -->|GET /api/employees.php| C[ensure_authenticated]
    C --> D{Authenticated?}
    D -->|No| E[Return 401]
    D -->|Yes| F[Query All Employees]
    F --> G[Return Employees List]
    
    B -->|POST /api/employees.php| H[ensure_authenticated]
    H --> I{Authenticated?}
    I -->|No| E
    I -->|Yes| J[Validate Required Fields]
    J --> K{All Required Present?}
    K -->|No| L[Return 422]
    K -->|Yes| M[Check Email Uniqueness]
    M --> N{Email Exists?}
    N -->|Yes| O[Return 409 Conflict]
    N -->|No| P[Prepare Insert Statement]
    P --> Q[Insert into employees table]
    Q --> R[Fetch Created Employee]
    R --> S[Return Employee Object]
    
    B -->|PUT /api/employees.php| T[ensure_authenticated]
    T --> U{Authenticated?}
    U -->|No| E
    U -->|Yes| V[Validate Employee ID]
    V --> W{Valid ID?}
    W -->|No| L
    W -->|Yes| X[Prepare Update Statement]
    X --> Y[Update employees table]
    Y --> Z[Fetch Updated Employee]
    Z --> AA[Return Employee Object]
    
    B -->|DELETE /api/employees.php| AB[ensure_authenticated]
    AB --> AC{Authenticated?}
    AC -->|No| E
    AC -->|Yes| AD[Validate Employee ID]
    AD --> AE{Valid ID?}
    AE -->|No| L
    AE -->|Yes| AF[Delete from employees table]
    AF --> AG[Cascade Delete Attendance]
    AG --> AH[Return Success Message]
    
    AI[Frontend: Load Employees] --> AJ[GET /api/employees.php]
    AJ --> AK[Receive Employees List]
    AK --> AL[Filter & Search]
    AL --> AM[Render Employee Table]
    AM --> AN[Update Statistics]
    
    AO[Frontend: Create Employee] --> AP[Fill Employee Form]
    AP --> AQ[Validate Form]
    AQ --> AR{Valid?}
    AR -->|No| AS[Show Validation Error]
    AR -->|Yes| AT[POST /api/employees.php]
    AT --> S
    S --> AU[Show Success Message]
    AU --> AV[Redirect to Employees List]
    AS --> AP
    
    AW[Frontend: Delete Employee] --> AX[Confirm Deletion]
    AX --> AY{Confirmed?}
    AY -->|No| AZ[Cancel]
    AY -->|Yes| AF
    AF --> BA[Reload Employees List]
```

---

## 4. Attendance Management Module Flow

Tracks employee attendance with check-in/check-out times, status, and notes.

```mermaid
flowchart TD
    A[Attendance Request] --> B{Request Type}
    
    B -->|GET /api/attendance.php| C[ensure_authenticated]
    C --> D{Authenticated?}
    D -->|No| E[Return 401]
    D -->|Yes| F{Has employee_id Param?}
    F -->|Yes| G{Has date Param?}
    G -->|Yes| H[Query by employee_id & date]
    G -->|No| I[Query by employee_id]
    F -->|No| J[Query All Attendance]
    H --> K[Return Single Record]
    I --> L[Return Employee Records]
    J --> M[Return All Records]
    
    B -->|POST /api/attendance.php| N[ensure_authenticated]
    N --> O{Authenticated?}
    O -->|No| E
    O -->|Yes| P[Validate Required Fields]
    P --> Q{Valid?}
    Q -->|No| R[Return 422]
    Q -->|Yes| S[Check Duplicate Attendance]
    S --> T{Already Exists?}
    T -->|Yes| U[Return 409 Conflict]
    T -->|No| V[Insert into attendance table]
    V --> W[Fetch Created Record]
    W --> X[Return Attendance Object]
    
    B -->|PATCH /api/attendance.php| Y[ensure_authenticated]
    Y --> Z{Authenticated?}
    Z -->|No| E
    Z -->|Yes| AA[Validate Attendance ID]
    AA --> AB{Valid ID?}
    AB -->|No| R
    AB -->|Yes| AC[Update attendance table]
    AC --> AD[Update check_in_time, check_out_time, status, notes]
    AD --> AE[Fetch Updated Record]
    AE --> AF[Return Attendance Object]
    
    AG[Frontend: Mark Attendance] --> AH[Load Active Employees]
    AH --> AI[GET /api/employees.php]
    AI --> AJ[Filter Active Employees]
    AJ --> AK[Render Employee List]
    AK --> AL[User Selects Status per Employee]
    AL --> AM[Store Attendance Data]
    AM --> AN[User Submits Form]
    AN --> AO{Has Date?}
    AO -->|No| AP[Show Error]
    AO -->|Yes| AQ{Has Attendance Data?}
    AQ -->|No| AP
    AQ -->|Yes| AR[Loop Through Employees]
    AR --> AS[POST /api/attendance.php]
    AS --> AT{Success?}
    AT -->|No| AU{Already Exists?}
    AU -->|Yes| AV[GET Existing Record]
    AV --> AW[PATCH /api/attendance.php]
    AW --> AT
    AU -->|No| AX[Show Error]
    AT -->|Yes| AY[Continue Loop]
    AY --> AZ{More Employees?}
    AZ -->|Yes| AR
    AZ -->|No| BA[Show Success]
    BA --> BB[Redirect to Attendance List]
    
    BC[Frontend: View Attendance] --> BD[GET /api/attendance.php]
    BD --> BE[GET /api/employees.php]
    BE --> BF[Combine Data]
    BF --> BG[Apply Filters]
    BG --> BH[Render Attendance Table]
    BH --> BI[Update Statistics]
```

---

## 5. Database Access Module Flow

Manages database connections, query execution, and error handling.

```mermaid
flowchart TD
    A[Module Requests Database] --> B[Call db Function]
    B --> C{Connection Exists?}
    C -->|Yes| D[Return Existing PDO]
    C -->|No| E[Read DB Configuration]
    E --> F[DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]
    F --> G[Create DSN String]
    G --> H[Initialize PDO]
    H --> I{Connection Success?}
    I -->|No| J[Throw Exception]
    I -->|Yes| K[Set PDO Attributes]
    K --> L[ERRMODE: EXCEPTION]
    L --> M[DEFAULT_FETCH_MODE: ASSOC]
    M --> N[Store PDO in Static Variable]
    N --> D
    D --> O[Execute Query]
    O --> P{Query Type}
    P -->|SELECT| Q[Prepare Statement]
    P -->|INSERT| R[Prepare Statement]
    P -->|UPDATE| S[Prepare Statement]
    P -->|DELETE| T[Prepare Statement]
    Q --> U[Execute with Parameters]
    R --> U
    S --> U
    T --> U
    U --> V{Success?}
    V -->|No| W[Log Error]
    W --> X[Throw Exception]
    V -->|Yes| Y{Has Result?}
    Y -->|Yes| Z[Fetch Data]
    Y -->|No| AA[Return Success]
    Z --> AB[Return Array/Row]
```

---

## 6. API Service Layer Module Flow

Handles HTTP requests, routing, validation, and JSON responses.

```mermaid
flowchart TD
    A[HTTP Request Received] --> B[Extract Request Method]
    B --> C{Method Type}
    C -->|GET| D[Read Query Parameters]
    C -->|POST| E[Read JSON Body]
    C -->|PUT| E
    C -->|PATCH| E
    C -->|DELETE| E
    D --> F[Validate Parameters]
    E --> G[get_json_body]
    G --> H[Parse JSON]
    H --> I{Valid JSON?}
    I -->|No| J[Return 422]
    I -->|Yes| F
    F --> K{Endpoint Requires Auth?}
    K -->|Yes| L[ensure_authenticated]
    K -->|No| M[Process Request]
    L --> N{Authenticated?}
    N -->|No| O[Return 401]
    N -->|Yes| P{Requires Role?}
    P -->|Yes| Q[ensure_role]
    P -->|No| M
    Q --> R{Has Role?}
    R -->|No| S[Return 403]
    R -->|Yes| M
    M --> T[Validate Input Data]
    T --> U{Valid?}
    U -->|No| J
    U -->|Yes| V[Execute Business Logic]
    V --> W{Success?}
    W -->|No| X[Log Error]
    X --> Y[Return 500]
    W -->|Yes| Z[Prepare Response Data]
    Z --> AA[json_response]
    AA --> AB[Set HTTP Status Code]
    AB --> AC[Set Content-Type: application/json]
    AC --> AD[Encode JSON]
    AD --> AE[Send Response]
    AE --> AF[Exit Script]
```

---

## 7. Frontend UI Module Flow

Manages user interface interactions, form handling, API communication, and state management.

```mermaid
flowchart TD
    A[Page Load] --> B[DOMContentLoaded]
    B --> C{Page Type}
    C -->|Login| D[Check Existing Session]
    C -->|Dashboard| E[Check Auth Token]
    C -->|Protected Page| E
    D --> F{Token in localStorage?}
    F -->|Yes| G[Validate Token]
    G --> H{Valid?}
    H -->|Yes| I[Load Dashboard]
    H -->|No| J[Show Login Form]
    F -->|No| J
    E --> K{Token Exists?}
    K -->|No| L[Redirect to Login]
    K -->|Yes| M[Load Page Content]
    
    J --> N[User Fills Login Form]
    N --> O[Validate Form Client-Side]
    O --> P{Valid?}
    P -->|No| Q[Show Validation Errors]
    P -->|Yes| R[POST /api/login.php]
    R --> S{Success?}
    S -->|No| T[Show Error Message]
    S -->|Yes| U[Store Token in localStorage]
    U --> V[Store User in localStorage]
    V --> I
    
    I --> W[Load Dashboard Data]
    W --> X[GET /api/employees.php]
    X --> Y[Update Employee Count]
    Y --> Z[Display Dashboard]
    
    AA[User Navigates to Employees] --> AB[Load employees.html]
    AB --> AC[Check Auth]
    AC --> AD{Authenticated?}
    AD -->|No| L
    AD -->|Yes| AE[GET /api/employees.php]
    AE --> AF[Render Employee Table]
    AF --> AG[Setup Search & Filter]
    AG --> AH[User Interacts]
    AH --> AI{Action Type}
    AI -->|Search| AJ[Filter Employees]
    AI -->|Delete| AK[Confirm Delete]
    AI -->|Create| AL[Navigate to new-employee.html]
    AJ --> AF
    AK --> AM{Confirmed?}
    AM -->|Yes| AN[DELETE /api/employees.php]
    AM -->|No| AH
    AN --> AE
    
    AO[User Creates Employee] --> AP[Fill Employee Form]
    AP --> AQ[Validate Form]
    AQ --> AR{Valid?}
    AR -->|No| AS[Show Validation Error]
    AR -->|Yes| AT[POST /api/employees.php]
    AT --> AU{Success?}
    AU -->|No| AV[Show Error]
    AU -->|Yes| AW[Show Success]
    AW --> AX[Redirect to employees.html]
    
    AY[User Marks Attendance] --> AZ[Load mark-attendance.html]
    AZ --> BA[Check Auth]
    BA --> BB{Authenticated?}
    BB -->|No| L
    BB -->|Yes| BC[GET /api/employees.php]
    BC --> BD[Filter Active Employees]
    BD --> BE[Render Employee Cards]
    BE --> BF[User Selects Status]
    BF --> BG[Update Attendance Data]
    BG --> BH[User Submits]
    BH --> BI[Loop Through Employees]
    BI --> BJ[POST /api/attendance.php]
    BJ --> BK{Success?}
    BK -->|No| BL{Already Exists?}
    BL -->|Yes| BM[GET Existing Record]
    BM --> BN[PATCH /api/attendance.php]
    BN --> BK
    BL -->|No| BO[Show Error]
    BK -->|Yes| BP{More Employees?}
    BP -->|Yes| BI
    BP -->|No| BQ[Show Success]
    BQ --> BR[Redirect to attendance.html]
    
    BS[User Views Attendance] --> BT[Load attendance.html]
    BT --> BU[Check Auth]
    BU --> BV{Authenticated?}
    BV -->|No| L
    BV -->|Yes| BW[GET /api/attendance.php]
    BW --> BX[GET /api/employees.php]
    BX --> BY[Combine Data]
    BY --> BZ[Apply Filters]
    BZ --> CA[Render Attendance Table]
    CA --> CB[Update Statistics]
    
    CC[User Logs Out] --> CD[POST /api/logout.php]
    CD --> CE[Clear localStorage]
    CE --> CF[Destroy Session]
    CF --> L
```

---

## 8. Configuration & Utilities Module Flow

Initializes system configuration, sessions, and provides shared utility functions.

```mermaid
flowchart TD
    A[PHP Script Loads] --> B[Require config.php]
    B --> C[Start PHP Session]
    C --> D[session_start]
    D --> E[Define Constants]
    E --> F[DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]
    F --> G[Define Helper Functions]
    G --> H[db Function Available]
    G --> I[json_response Function Available]
    G --> J[get_json_body Function Available]
    G --> K[ensure_authenticated Function Available]
    G --> L[ensure_role Function Available]
    G --> M[set_session_user Function Available]
    
    N[API Endpoint Loads] --> O[Require config.php]
    O --> P[Session Initialized]
    P --> Q[Helper Functions Available]
    Q --> R[Process Request]
    
    S[Frontend Script Loads] --> T[Define API_BASE_URL]
    T --> U[Setup Event Listeners]
    U --> V[Initialize Application]
    
    W[Database Connection Needed] --> X[Call db Function]
    X --> Y[Check Static PDO Variable]
    Y --> Z{PDO Exists?}
    Z -->|Yes| AA[Return Existing Connection]
    Z -->|No| AB[Create New PDO Connection]
    AB --> AC[Store in Static Variable]
    AC --> AA
    
    AD[JSON Response Needed] --> AE[Call json_response]
    AE --> AF[Set HTTP Status Code]
    AF --> AG[Set Content-Type Header]
    AG --> AH[Encode Data to JSON]
    AH --> AI[Output JSON]
    AI --> AJ[Exit Script]
    
    AK[Read Request Body] --> AL[Call get_json_body]
    AL --> AM[Read php://input]
    AM --> AN[Decode JSON]
    AN --> AO{Valid JSON?}
    AO -->|Yes| AP[Return Array]
    AO -->|No| AQ[Return Empty Array]
```

