# Dayflow - Human Resource Management System

**Every workday, perfectly aligned.**

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- Gmail account (for email notifications)

### Backend Setup
```bash
cd backend
npm install
# Configure .env file (see backend/README.md)
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

📖 **For detailed setup instructions, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**

## 🚀 Overview

Dayflow is a comprehensive Human Resource Management System (HRMS) built with the MERN stack. It digitizes and streamlines core HR operations including employee onboarding, profile management, attendance tracking, leave management, payroll visibility, and approval workflows.

## ✨ Features

### Authentication & Authorization
- Secure sign-up with email verification
- JWT-based authentication
- Role-based access control (Employee/Admin/HR)

### Employee Features
- Personal profile management with document uploads
- Daily check-in/check-out attendance tracking
- Leave application with multiple types (Paid, Sick, Unpaid)
- Payroll visibility
- Profile picture upload

### Admin/HR Features
- Employee management dashboard
- Attendance monitoring and management
- Leave approval workflow with email notifications
- Payroll management and updates
- Export attendance and payroll reports
- Document verification

### Additional Features
- Email notifications for leave approvals/rejections
- Document upload functionality
- Export features for reports (CSV/PDF)
- Real-time dashboard analytics
- Responsive, industry-grade UI

## 🛠️ Technology Stack

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Modern CSS with glassmorphism effects

### Backend
- Node.js
- Express.js
- MongoDB Atlas (Cloud Database)
- JWT for authentication
- Nodemailer for email notifications
- Multer for file uploads

## 📁 Project Structure

```
Dayflow/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
npm install
```

2. Create `.env` file and add your MongoDB URI:
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
PORT=5000
```

3. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 👥 User Roles

### Employee
- View and edit personal profile
- Track attendance
- Apply for leave
- View salary details

### Admin/HR Officer
- Manage all employees
- Approve/reject leave requests
- Monitor attendance
- Update payroll
- Export reports

## 📧 Email Notifications

The system sends automated email notifications for:
- Email verification during sign-up
- Leave request submissions
- Leave approvals/rejections
- Important HR announcements

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Built with ❤️ for modern HR management
