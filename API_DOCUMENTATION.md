# Dayflow HRMS API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Sign Up
```http
POST /auth/signup
```

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "employee"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "employeeId": "EMP001",
    "email": "john@example.com",
    "role": "employee"
  },
  "token": "jwt_token_here"
}
```

#### Sign In
```http
POST /auth/signin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "employeeId": "EMP001",
    "email": "john@example.com",
    "role": "employee"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "employeeId": "EMP001",
    "email": "john@example.com",
    "role": "employee"
  },
  "employee": {
    "_id": "...",
    "employeeId": "EMP001",
    "personalDetails": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Employee Management

#### Get All Employees (Admin/HR only)
```http
GET /employees/all
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "employeeId": "EMP001",
    "personalDetails": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890",
      "address": "123 Street"
    },
    "jobDetails": {
      "designation": "Developer",
      "department": "IT"
    }
  }
]
```

#### Get Employee Profile
```http
GET /employees/:employeeId
```

**Parameters:**
- `employeeId`: Employee ID

**Response:**
```json
{
  "_id": "...",
  "employeeId": "EMP001",
  "personalDetails": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Update Employee Profile
```http
PUT /employees/:employeeId
```

**Request Body (Employee can update):**
```json
{
  "personalDetails": {
    "phone": "9876543210",
    "address": "New Address"
  }
}
```

**Request Body (Admin can update):**
```json
{
  "personalDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210"
  },
  "jobDetails": {
    "designation": "Senior Developer",
    "department": "Engineering"
  }
}
```

### Attendance

#### Check In
```http
POST /attendance/checkin
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Checked in successfully",
  "attendance": {
    "_id": "...",
    "employeeId": "EMP001",
    "date": "2026-01-03",
    "checkIn": "2026-01-03T09:00:00Z",
    "status": "present"
  }
}
```

#### Check Out
```http
POST /attendance/checkout
```

**Response:**
```json
{
  "message": "Checked out successfully",
  "attendance": {
    "_id": "...",
    "checkOut": "2026-01-03T18:00:00Z"
  }
}
```

#### Get Employee Attendance
```http
GET /attendance/:employeeId?startDate=2026-01-01&endDate=2026-01-31
```

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
[
  {
    "_id": "...",
    "employeeId": "EMP001",
    "date": "2026-01-03",
    "checkIn": "2026-01-03T09:00:00Z",
    "checkOut": "2026-01-03T18:00:00Z",
    "status": "present"
  }
]
```

#### Get All Attendance (Admin/HR only)
```http
GET /attendance/all?startDate=2026-01-01&endDate=2026-01-31
```

#### Update Attendance (Admin/HR only)
```http
PUT /attendance/:id
```

**Request Body:**
```json
{
  "status": "absent",
  "remarks": "Unauthorized absence"
}
```

### Leave Management

#### Apply for Leave
```http
POST /leaves/apply
```

**Request Body:**
```json
{
  "leaveType": "paid",
  "startDate": "2026-01-10",
  "endDate": "2026-01-12",
  "reason": "Personal work"
}
```

**Response:**
```json
{
  "message": "Leave request submitted successfully",
  "leave": {
    "_id": "...",
    "employeeId": "EMP001",
    "leaveType": "paid",
    "startDate": "2026-01-10",
    "endDate": "2026-01-12",
    "status": "pending"
  }
}
```

#### Get My Leaves
```http
GET /leaves/my-leaves
```

**Response:**
```json
[
  {
    "_id": "...",
    "leaveType": "paid",
    "startDate": "2026-01-10",
    "endDate": "2026-01-12",
    "reason": "Personal work",
    "status": "pending"
  }
]
```

#### Get All Leaves (Admin/HR only)
```http
GET /leaves/all?status=pending&employeeId=EMP001
```

**Query Parameters:**
- `status` (optional): Filter by status
- `employeeId` (optional): Filter by employee

#### Approve/Reject Leave (Admin/HR only)
```http
PUT /leaves/:id
```

**Request Body:**
```json
{
  "status": "approved",
  "approverComments": "Approved for personal reasons"
}
```

### Payroll

#### Get My Payroll
```http
GET /payroll/my-payroll
```

**Response:**
```json
{
  "_id": "...",
  "employeeId": "EMP001",
  "basicSalary": 50000,
  "allowances": {
    "hra": 10000,
    "transport": 2000
  },
  "deductions": {
    "tax": 5000,
    "providentFund": 2000
  },
  "netSalary": 55000
}
```

#### Get Employee Payroll (Admin/HR only)
```http
GET /payroll/:employeeId
```

#### Get All Payrolls (Admin/HR only)
```http
GET /payroll/all
```

#### Create/Update Payroll (Admin/HR only)
```http
POST /payroll
```

**Request Body:**
```json
{
  "employeeId": "EMP001",
  "userId": "user_id_here",
  "basicSalary": 50000,
  "allowances": {
    "hra": 10000,
    "transport": 2000,
    "medical": 1500
  },
  "deductions": {
    "tax": 5000,
    "providentFund": 2000
  },
  "effectiveFrom": "2026-01-01"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error message here"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error"
}
```

## Status Codes

- `200 OK`: Successful GET, PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
