# HRMS Backend Setup Guide

## Overview

This is the Node.js/Express backend for the Human Resource Management System (HRMS), connected to MongoDB Atlas.

## Prerequisites

- Node.js v14 or higher
- npm or yarn
- MongoDB Atlas account (free tier available at https://mongodb.com/cloud/atlas)

## Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<username>` and `<password>` with your credentials
7. Add your database name to the connection string

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dayflow?retryWrites=true&w=majority
```

### 3. Configure Environment Variables

Edit `.env` file in the server directory:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dayflow?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Replace:
- `MONGODB_URI` with your actual MongoDB Atlas connection string
- `JWT_SECRET` with a strong secret key

### 4. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `GET /api/attendance/employee/:employeeId` - Get attendance by employee
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance record
- `DELETE /api/attendance/:id` - Delete attendance record

### Leaves
- `GET /api/leaves` - Get all leave requests
- `GET /api/leaves/:id` - Get leave by ID
- `GET /api/leaves/employee/:employeeId` - Get leaves by employee
- `POST /api/leaves` - Create leave request
- `PUT /api/leaves/:id` - Update leave request
- `DELETE /api/leaves/:id` - Delete leave request

## Database Models

### User
```javascript
{
  employeeId: String (unique),
  email: String (unique),
  password: String (hashed),
  role: 'employee' | 'admin',
  name: String,
  emailVerified: Boolean
}
```

### EmployeeProfile
```javascript
{
  userId: ObjectId (ref: User),
  employeeId: String (unique),
  name: String,
  email: String,
  phone: String,
  address: String,
  dateOfBirth: String,
  gender: String,
  jobTitle: String,
  department: String,
  joinDate: String,
  salary: Number,
  bankAccountNumber: String,
  bankIFSC: String,
  panNumber: String,
  aadhaarNumber: String,
  emergencyContact: String,
  emergencyContactNumber: String
}
```

### Attendance
```javascript
{
  employeeId: ObjectId (ref: EmployeeProfile),
  date: Date,
  checkInTime: String,
  checkOutTime: String,
  status: 'present' | 'absent' | 'late' | 'halfday',
  remarks: String
}
```

### Leave
```javascript
{
  employeeId: ObjectId (ref: EmployeeProfile),
  leaveType: 'sick' | 'casual' | 'earned' | 'unpaid',
  startDate: Date,
  endDate: Date,
  reason: String,
  status: 'pending' | 'approved' | 'rejected',
  approvedBy: ObjectId (ref: User),
  remarks: String
}
```

## Running the Project

### Terminal 1 (Backend):
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

### Terminal 2 (Frontend):
```bash
cd client
npm run dev
# Frontend will run on http://localhost:5173
```

## Security Notes

⚠️ **Important:**
- Keep your `.env` file secure and never commit it to Git
- Always hash passwords with bcrypt
- Use JWT tokens for authentication
- Never expose MongoDB URI in frontend code

## Troubleshooting

### Connection to MongoDB fails
- Check your internet connection
- Verify MongoDB URI in `.env`
- Ensure IP whitelist in MongoDB Atlas includes your IP
- Check if the database credentials are correct

### Port 5000 already in use
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### CORS errors
- Ensure `cors` middleware is enabled in `server.js`
- Check frontend VITE_API_URL in `.env`

## Next Steps

After setting up the backend:
1. Configure frontend `.env` with `VITE_API_URL=http://localhost:5000/api`
2. Start both frontend and backend servers
3. Test API endpoints using a tool like Postman
4. Deploy to production (e.g., Heroku, AWS, Azure)

For deployment, update:
- MongoDB URI for production database
- JWT_SECRET with a secure key
- VITE_API_URL in frontend to point to production backend
