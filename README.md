# Dayflow – Human Resource Management System (HRMS)

Every workday, perfectly aligned.

Dayflow is a **web-based Human Resource Management System** designed to digitize and streamline core HR operations such as employee onboarding, profile management, attendance tracking, leave workflows, and payroll visibility.  
The system is built with scalability, role-based access, and clean modular design in mind.

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure Sign Up / Sign In
- Email & password-based authentication
- Role-based access control (Admin / Employee)

### 👤 Employee Management
- Employee onboarding using Employee ID
- Personal and job profile management
- Profile picture and document uploads

### 🕒 Attendance Management
- Daily attendance tracking
- Check-in / Check-out system
- Attendance status:
  - Present
  - Absent
  - Half-day
  - Leave
- Weekly and historical attendance views

### 🌴 Leave & Time-Off Management
- Leave types:
  - Paid Leave
  - Sick Leave
  - Unpaid Leave
- Leave request lifecycle:
  - Pending
  - Approved
  - Rejected
- Admin/HR approval workflow with comments

### 💰 Payroll Management
- Salary structure visibility for employees (read-only)
- Payroll control and updates by Admin
- Monthly payroll records
- Salary components: basic, allowances, deductions

### 🔔 Notifications & Logs
- System notifications for approvals and updates
- Admin action logging for audit and accountability

---

## 🏗️ Tech Stack

### Frontend
- React.js
- HTML, CSS, JavaScript
- Axios (API communication)

### Backend
- Node.js
- Express.js
- RESTful APIs

### Database
- MongoDB (NoSQL)
- Schema-driven design

### Authentication
- JWT-based authentication
- Password hashing

---

## 🗂️ Database Design (High Level)

Main collections used in the system:
- User
- EmployeeProfile
- Attendance
- LeaveRequest
- Payroll
- Document
- Notification
- AuditLog

Each collection is designed to support role-based access, scalability, and clean data relationships.

---

## 👥 User Roles

### Employee
- View personal profile
- Check-in / check-out attendance
- Apply for leave
- View leave status
- View payroll details

### Admin / HR Officer
- Manage employee records
- View and manage attendance of all employees
- Approve or reject leave requests
- Manage payroll
- Access reports and audit logs

---

## 📌 Project Scope

The system focuses on:
- Digitizing HR workflows
- Reducing manual paperwork
- Improving transparency between employees and HR
- Providing a scalable base for future HR features

---

## 🔮 Future Enhancements

- Performance appraisal module
- Advanced analytics & reporting
- Email and push notifications
- Role-based dashboards with charts
- Integration with biometric or external attendance systems

---

## 🧠 Learning Outcomes

This project demonstrates:
- Full-stack web application architecture
- REST API design
- Role-based authorization
- Database schema design for real-world systems
- Practical implementation of HR workflows

---

## 📄 License

This project is developed for academic and learning purposes.

---

**Dayflow – Making every workday organized, transparent, and efficient.**
