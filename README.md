# Dayflow HRMS - Human Resource Management System

A comprehensive HR management system built with React, TypeScript, Node.js, Express, and MongoDB.

## Features

### Authentication & Authorization
- ✅ Secure signup and signin with JWT
- ✅ Role-based access control (Employee, HR, Admin)
- ✅ Password hashing with bcrypt
- ✅ Email validation

### Employee Dashboard
- ✅ Quick access to profile, attendance, leave, and payroll
- ✅ Recent activity overview
- ✅ Personalized greeting

### Admin/HR Dashboard
- ✅ Employee management
- ✅ Attendance tracking overview
- ✅ Leave approval workflow
- ✅ Payroll management
- ✅ Statistics dashboard

### Employee Profile Management
- ✅ View personal and job details
- ✅ Update limited fields (phone, address, profile picture)
- ✅ Admin can edit all employee details

### Attendance Management
- ✅ Daily check-in/check-out functionality
- ✅ Attendance history with status (Present, Absent, Half-day, Leave)
- ✅ Weekly and daily views
- ✅ Admin can view all employees' attendance

### Leave Management
- ✅ Apply for leave (Paid, Sick, Unpaid)
- ✅ Date range selection
- ✅ Leave status tracking (Pending, Approved, Rejected)
- ✅ Admin approval workflow with comments

### Payroll Management
- ✅ View salary structure (Basic, Allowances, Deductions)
- ✅ Read-only for employees
- ✅ Admin can update payroll information
- ✅ Automatic net salary calculation

## Tech Stack

### Backend
- Node.js & Express.js
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Axios for API calls
- Context API for state management
- date-fns for date formatting

## Project Structure

```
Dayflow/
├── backend/
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── index.ts       # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── index.tsx      # Entry point
│   ├── package.json
│   └── tsconfig.json
└── package.json           # Root package.json
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/FemilRanparia/Dayflow.git
   cd Dayflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. **Configure environment variables**

   Backend (.env):
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `backend/.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   Frontend (.env):
   ```bash
   cd frontend
   cp .env.example .env
   ```
   
   Edit `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**

   Option 1 - Run both together (from root):
   ```bash
   npm run dev
   ```

   Option 2 - Run separately:
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user

### Employee Management
- `GET /api/employees/all` - Get all employees (Admin/HR)
- `GET /api/employees/:employeeId` - Get employee profile
- `PUT /api/employees/:employeeId` - Update employee profile

### Attendance
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/:employeeId` - Get employee attendance
- `GET /api/attendance/all` - Get all attendance (Admin/HR)
- `PUT /api/attendance/:id` - Update attendance (Admin/HR)

### Leave Management
- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-leaves` - Get my leave requests
- `GET /api/leaves/all` - Get all leave requests (Admin/HR)
- `PUT /api/leaves/:id` - Approve/reject leave (Admin/HR)

### Payroll
- `GET /api/payroll/my-payroll` - Get my payroll
- `GET /api/payroll/:employeeId` - Get employee payroll (Admin/HR)
- `GET /api/payroll/all` - Get all payrolls (Admin/HR)
- `POST /api/payroll` - Create/update payroll (Admin/HR)

## User Roles

### Employee
- View and edit limited profile fields
- Check in/out for attendance
- View own attendance history
- Apply for leave
- View leave request status
- View own payroll (read-only)

### HR/Admin
- All employee permissions
- View all employees
- View all attendance records
- Update attendance records
- Approve/reject leave requests
- View and update all payrolls
- Manage employee profiles

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Role-based authorization
- Input validation
- CORS enabled

## Future Enhancements

- Email notifications for leave approvals
- Analytics and reporting dashboard
- Salary slip generation
- Attendance reports (monthly/yearly)
- Document upload functionality
- Performance review module
- Calendar integration
- Mobile app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Support

For support, email support@dayflow.com or create an issue in the repository.
