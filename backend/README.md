# Dayflow Backend API

RESTful API for the Dayflow Human Resource Management System.

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_uri_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
```

### 3. Gmail App Password Setup

To enable email notifications:
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for "Mail"
4. Use this app password in `EMAIL_PASS`

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "employeeId": "EMP001",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "Employee",
  "department": "IT",
  "designation": "Developer"
}
```

#### Verify Email
```http
GET /api/auth/verify-email/:token
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Endpoints

#### Get Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

#### Upload Profile Picture
```http
POST /api/users/profile-picture
Authorization: Bearer <token>
Content-Type: multipart/form-data

profilePicture: <file>
```

#### Upload Document
```http
POST /api/users/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

document: <file>
name: "Resume"
type: "Resume"
```

### Attendance Endpoints

#### Check In
```http
POST /api/attendance/check-in
Authorization: Bearer <token>
```

#### Check Out
```http
POST /api/attendance/check-out
Authorization: Bearer <token>
```

#### Get My Attendance
```http
GET /api/attendance/my-attendance?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

#### Get Today's Attendance
```http
GET /api/attendance/today
Authorization: Bearer <token>
```

### Leave Endpoints

#### Apply for Leave
```http
POST /api/leaves
Authorization: Bearer <token>
Content-Type: application/json

{
  "leaveType": "Paid",
  "startDate": "2026-01-20",
  "endDate": "2026-01-22",
  "reason": "Personal work"
}
```

#### Get My Leaves
```http
GET /api/leaves/my-leaves
Authorization: Bearer <token>
```

#### Get Leave Statistics
```http
GET /api/leaves/stats
Authorization: Bearer <token>
```

### Admin/HR Endpoints

#### Get All Employees
```http
GET /api/users/employees
Authorization: Bearer <token>
```

#### Update Employee
```http
PUT /api/users/employees/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "salary": {
    "basicSalary": 50000,
    "allowances": 5000,
    "deductions": 2000
  }
}
```

#### Get All Attendance
```http
GET /api/attendance/all?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

#### Get All Leaves
```http
GET /api/leaves?status=Pending
Authorization: Bearer <token>
```

#### Approve/Reject Leave
```http
PUT /api/leaves/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Approved",
  "hrComments": "Approved for personal reasons"
}
```

### Report Endpoints

#### Export Attendance Report
```http
GET /api/reports/attendance?startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

#### Export Leave Report
```http
GET /api/reports/leaves?status=Approved
Authorization: Bearer <token>
```

#### Export Payroll Report
```http
GET /api/reports/payroll
Authorization: Bearer <token>
```

#### Get Dashboard Statistics
```http
GET /api/reports/dashboard-stats
Authorization: Bearer <token>
```

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── attendanceController.js
│   ├── leaveController.js
│   └── reportController.js
├── middleware/
│   ├── auth.js              # JWT & role verification
│   ├── upload.js            # File upload handling
│   └── errorHandler.js      # Error handling
├── models/
│   ├── User.js              # User schema
│   ├── Attendance.js        # Attendance schema
│   └── Leave.js             # Leave schema
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── attendanceRoutes.js
│   ├── leaveRoutes.js
│   └── reportRoutes.js
├── uploads/
│   ├── profiles/            # Profile pictures
│   └── documents/           # Employee documents
├── utils/
│   └── emailService.js      # Email notifications
├── .env.example
├── .gitignore
├── package.json
└── server.js                # Entry point
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Email verification
- Role-based access control
- File upload validation
- CORS protection

## 📧 Email Notifications

The system sends automated emails for:
- Email verification during registration
- Leave approval/rejection
- Password reset

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer** - File uploads

## 📝 Notes

- All timestamps are in UTC
- File size limit: 5MB
- Supported file types: JPEG, PNG, PDF, DOC, DOCX
- JWT tokens expire in 7 days
