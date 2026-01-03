# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

A complete, production-ready HRMS built with React, TypeScript, Tailwind CSS, and a structured backend service layer.

## 🚀 Features

### Full-Fledged Backend Architecture
- ✅ Service layer pattern (Database Service)
- ✅ Type-safe data models
- ✅ CRUD operations for all entities
- ✅ Centralized data management
- ✅ Ready for API integration

### Authentication & Authorization
- ✅ Secure sign up and sign in
- ✅ Role-based access (Admin/Employee)
- ✅ Email validation
- ✅ Password security

### Employee Portal
- ✅ Personal dashboard with quick access
- ✅ Profile management (editable: phone, address, emergency contact)
- ✅ Attendance tracking with check-in/check-out
- ✅ Daily and weekly attendance views (DD/MM/YYYY format)
- ✅ Leave request system with multiple leave types
- ✅ Salary information in INR (read-only)
- ✅ Leave balance tracking

### Admin/HR Portal (Full Editorial Access)
- ✅ Comprehensive admin dashboard
- ✅ **Complete employee management** (add, edit, delete, view)
- ✅ **Full access to all employee data** including:
  - Personal details (name, phone, address, DOB, gender)
  - Job details (title, department, join date, salary)
  - Bank information (account, IFSC)
  - Government IDs (PAN, Aadhaar)
  - Emergency contacts
- ✅ Attendance monitoring for all employees
- ✅ Leave approval workflow with comments
- ✅ Payroll management with salary updates
- ✅ Advanced filtering and search
- ✅ All salaries displayed in INR (₹)
- ✅ All dates in DD/MM/YYYY format

## 🎯 Demo Accounts

**Admin Account (Full Access):**
- Email: `admin@dayflow.com`
- Password: `admin123`

**Employee Account:**
- Email: `employee@dayflow.com`
- Password: `employee123`

## 💰 Currency Format

All monetary values are displayed in **Indian Rupees (INR - ₹)**:
- Full format: ₹9,00,000
- Short format: ₹9.00 L (Lakhs), ₹1.20 Cr (Crores)
- Annual salary (CTC)
- Monthly breakdown

## 📅 Date Format

All dates use **DD/MM/YYYY** format:
- Example: 15/01/2024
- Join Date: 01/01/2024
- Date of Birth: 10/05/1995
- Leave dates: 15/02/2024 - 17/02/2024

## 💾 Data Storage

This application uses a **structured backend service layer** with localStorage:

### Database Service (`/services/database.ts`)
- Centralized data operations
- Type-safe interfaces
- CRUD methods for:
  - Users
  - Employee Profiles
  - Attendance Records
  - Leave Requests

### Data Models:

**User:**
- id, employeeId, email, password, role, name
- emailVerified, createdAt, updatedAt

**Employee Profile:**
- Personal: id, name, email, phone, address, dateOfBirth, gender
- Job: jobTitle, department, joinDate, salary
- Bank: bankAccountNumber, bankIFSC
- Government: panNumber, aadhaarNumber
- Emergency: emergencyContact, emergencyContactNumber

**Attendance Record:**
- id, userId, date (DD/MM/YYYY), checkIn, checkOut, status
- Status: present, absent, half-day, leave

**Leave Request:**
- id, userId, userName, leaveType, startDate, endDate
- remarks, status, adminComment, approvedBy
- Types: paid, sick, casual, unpaid

## 🏗️ Architecture

### Frontend Stack
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications

### Backend Service Layer
- **Database Service** - Centralized data operations
- **Date Utils** - DD/MM/YYYY formatting
- **Currency Utils** - INR formatting
- **Type-safe interfaces** - Full TypeScript support

### Project Structure
```
/
├── services/
│   └── database.ts              # Backend service layer
├── utils/
│   ├── dateUtils.ts             # Date formatting (DD/MM/YYYY)
│   └── currencyUtils.ts         # INR formatting
├── components/
│   ├── AuthPage.tsx             # Authentication
│   ├── EmployeeDashboard.tsx    # Employee portal
│   ├── AdminDashboard.tsx       # Admin portal
│   ├── employee/
│   │   ├── ProfileView.tsx      # Employee profile
│   │   ├── AttendanceView.tsx   # Attendance tracking
│   │   └── LeaveManagement.tsx  # Leave requests
│   └── admin/
│       ├── EmployeeList.tsx     # Full employee management
│       ├── AttendanceManagement.tsx
│       ├── LeaveApprovals.tsx
│       └── PayrollManagement.tsx
└── App.tsx                      # Main app component
```

## 🔑 Admin Capabilities

The admin has **full editorial access** to all employee data:

### Employee Management
- ✅ View all employee details
- ✅ Add new employees with complete information
- ✅ Edit all employee fields:
  - Basic info (name, email, phone, address, DOB, gender)
  - Job details (title, department, join date, salary, role)
  - Bank details (account number, IFSC code)
  - Government IDs (PAN, Aadhaar)
  - Emergency contacts
- ✅ Delete employees (with confirmation)
- ✅ Search and filter employees

### Attendance Management
- ✅ View attendance for all employees
- ✅ Filter by date (DD/MM/YYYY)
- ✅ Filter by status (present, absent, half-day, leave)
- ✅ Search employees
- ✅ Real-time statistics

### Leave Management
- ✅ Approve/reject leave requests
- ✅ Add comments to leave decisions
- ✅ View leave history
- ✅ Filter by status
- ✅ Track leave types (paid, sick, casual, unpaid)

### Payroll Management
- ✅ View all employee salaries in INR
- ✅ Update salary structures
- ✅ See monthly breakdown
- ✅ Payroll statistics (total, average, highest)
- ✅ Search and filter

## 🔧 Key Features

### 1. Backend Service Layer
Instead of direct localStorage access, all data operations go through a centralized Database Service:
- Type-safe CRUD operations
- Automatic timestamp management
- Consistent data structure
- Easy to migrate to real database

### 2. Indian Standards
- **Currency**: All amounts in INR (₹)
- **Date Format**: DD/MM/YYYY throughout
- **Phone Numbers**: +91 format
- **Numbering**: Lakhs and Crores support

### 3. Complete Employee Data
Admin can manage:
- Personal information
- Job details
- Salary (₹)
- Bank account details
- PAN and Aadhaar numbers
- Emergency contacts

### 4. Leave Types
- Paid Leave (18 days/year)
- Sick Leave (12 days/year)
- Casual Leave (10 days/year)
- Unpaid Leave

## 🎨 Design System

- Clean, minimal interface
- Responsive layouts (mobile-friendly)
- Consistent color scheme
- Smooth transitions
- Indian rupee symbol (₹)
- DD/MM/YYYY date displays

## 🔐 Security Considerations

**Current Implementation (Demo):**
- Passwords stored in plain text
- Client-side only
- localStorage persistence

**For Production:**
- Implement backend API
- Use bcrypt/argon2 for passwords
- JWT authentication
- HTTPS encryption
- Database (PostgreSQL/MongoDB)
- PII data encryption

## 🚀 Converting to Production (MongoDB Atlas)

To convert this to use MongoDB Atlas:

1. **Set up backend server** (Node.js/Express):
```javascript
// Example: Connect to MongoDB Atlas
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
```

2. **Replace Database Service**:
```typescript
// Instead of localStorage, use API calls
const response = await fetch('/api/employees', {
  method: 'POST',
  body: JSON.stringify(employeeData)
});
```

3. **Create API Routes**:
- `/api/auth/login` - Authentication
- `/api/employees` - Employee CRUD
- `/api/attendance` - Attendance tracking
- `/api/leaves` - Leave management
- `/api/payroll` - Salary management

4. **Update environment variables**:
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
```

The service layer (`/services/database.ts`) is already structured to make this transition easy - just replace the localStorage calls with API fetch calls.

## 📝 Usage

### For Employees:
1. Sign in with employee credentials
2. Check in/out daily
3. View attendance history
4. Apply for leaves
5. View profile and salary
6. Update personal details (phone, address, emergency contact)

### For Admins:
1. Sign in with admin credentials
2. Manage all employees (full CRUD)
3. Monitor attendance
4. Approve/reject leaves
5. Manage payroll
6. Update salaries
7. Access complete employee information

## 🔄 Data Reset

Use the "Reset Demo Data" button on the login page to restore default demo accounts and clear all data.

## 📄 License

This project is created for demonstration purposes.

---

**Built with Figma Make** - Every workday, perfectly aligned.

**Currency**: Indian Rupees (₹)  
**Date Format**: DD/MM/YYYY  
**Backend**: Service Layer Architecture
