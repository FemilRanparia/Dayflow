# Dayflow Frontend

React-based frontend for the Dayflow Human Resource Management System.

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with:
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   └── Navbar.js          # Navigation component
│   ├── context/
│   │   └── AuthContext.js     # Authentication state management
│   ├── pages/
│   │   ├── Login.js           # Login page
│   │   ├── Register.js        # Registration page
│   │   ├── VerifyEmail.js     # Email verification
│   │   ├── EmployeeDashboard.js
│   │   ├── AdminDashboard.js
│   │   ├── Profile.js
│   │   ├── Attendance.js
│   │   ├── LeaveManagement.js
│   │   └── Employees.js
│   ├── services/
│   │   ├── api.js             # Axios configuration
│   │   └── services.js        # API service functions
│   ├── App.js                 # Main app with routing
│   ├── index.css              # Global styles
│   └── index.js               # Entry point
├── .env
├── .gitignore
└── package.json
```

## 🎨 Design System

The app uses a comprehensive CSS design system with:
- **Color Palette**: Vibrant gradients and modern colors
- **Typography**: Inter font family
- **Components**: Buttons, forms, cards, badges, tables
- **Animations**: Fade-in, slide-in, pulse effects
- **Glassmorphism**: Modern card designs
- **Responsive**: Mobile-first approach

## 🔐 Authentication Flow

1. User registers with email verification
2. Email sent with verification link
3. User clicks link to verify email
4. User can then login
5. JWT token stored in localStorage
6. Protected routes check authentication

## 📱 Pages

### Public Pages
- **Login**: Email/password authentication
- **Register**: User registration with email verification
- **Verify Email**: Email verification handler

### Protected Pages
- **Dashboard**: Role-based dashboard (Employee/Admin)
- **Profile**: View and edit user profile
- **Attendance**: Check-in/out and view attendance
- **Leaves**: Apply for leave and view status
- **Employees**: (Admin only) Manage employees

## 🛠️ Technologies

- React 18
- React Router v6
- Axios
- Context API for state management
- CSS3 with modern features

## 📝 Notes

- Some pages are placeholders and need full implementation
- The core authentication and routing is complete
- API services are fully configured
- Design system is production-ready
