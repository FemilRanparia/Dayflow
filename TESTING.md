# Testing Guide - Dayflow HRMS

This guide provides step-by-step instructions for testing all features of the Dayflow HRMS application.

## Prerequisites

Before testing, ensure:
- Backend is running on http://localhost:5000
- Frontend is running on http://localhost:3000
- MongoDB is connected and running

## Test Scenarios

### 1. Authentication Tests

#### Test 1.1: User Signup (Employee)
**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign Up" link
3. Fill in the form:
   - Employee ID: `EMP001`
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Role: `Employee`
4. Click "Sign Up"

**Expected Result:**
- User is created successfully
- User is automatically logged in
- Redirected to Employee Dashboard

#### Test 1.2: User Signup (Admin)
**Steps:**
1. Logout if logged in
2. Click "Sign Up"
3. Fill in the form:
   - Employee ID: `ADMIN001`
   - First Name: `Admin`
   - Last Name: `User`
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `Admin`
4. Click "Sign Up"

**Expected Result:**
- Admin user created
- Redirected to Admin Dashboard

#### Test 1.3: User Signin
**Steps:**
1. Logout if logged in
2. Navigate to Sign In page
3. Enter credentials:
   - Email: `john@example.com`
   - Password: `password123`
4. Click "Sign In"

**Expected Result:**
- Successfully logged in
- Redirected to appropriate dashboard based on role

#### Test 1.4: Invalid Login
**Steps:**
1. Try to login with incorrect password
   - Email: `john@example.com`
   - Password: `wrongpassword`

**Expected Result:**
- Error message: "Invalid credentials"
- User remains on login page

### 2. Employee Dashboard Tests

#### Test 2.1: Dashboard Access
**Steps:**
1. Login as employee (`john@example.com`)
2. View dashboard

**Expected Result:**
- Welcome message with employee name
- Four cards displayed: Profile, Attendance, Leave Requests, Payroll
- Quick actions section visible

#### Test 2.2: Navigation
**Steps:**
1. Click on each dashboard card
2. Verify navigation works

**Expected Result:**
- Profile card → Profile page
- Attendance card → Attendance page
- Leave Requests card → Leave page
- Payroll card → Payroll page

### 3. Profile Management Tests

#### Test 3.1: View Profile
**Steps:**
1. Login as employee
2. Navigate to Profile page
3. View profile details

**Expected Result:**
- Personal details displayed (Employee ID, Name, Email)
- Phone and Address shown (or "Not set")
- Job details displayed

#### Test 3.2: Edit Profile (Employee)
**Steps:**
1. Click "Edit Profile"
2. Update:
   - Phone: `1234567890`
   - Address: `123 Main St, City, State`
3. Click "Save Changes"

**Expected Result:**
- Profile updated successfully
- Message: "Profile updated successfully"
- New values displayed

#### Test 3.3: View Other Employee Profile (Admin)
**Steps:**
1. Login as admin
2. Navigate to Employees list
3. Click on an employee
4. View profile

**Expected Result:**
- Can view any employee's profile
- Can edit all fields including job details

### 4. Attendance Tests

#### Test 4.1: Check In
**Steps:**
1. Login as employee
2. Navigate to Attendance page
3. Click "Check In"

**Expected Result:**
- Success message: "Checked in successfully"
- Check In button becomes disabled
- Current date entry appears in attendance history

#### Test 4.2: Check Out
**Steps:**
1. After checking in
2. Click "Check Out"

**Expected Result:**
- Success message: "Checked out successfully"
- Check Out button becomes disabled
- Attendance record updated with checkout time

#### Test 4.3: Duplicate Check In Prevention
**Steps:**
1. After checking in once
2. Try to check in again

**Expected Result:**
- Button is disabled
- Shows "Already Checked In"

#### Test 4.4: View Attendance History
**Steps:**
1. Navigate to Attendance page
2. View the attendance table

**Expected Result:**
- Table displays all attendance records
- Shows Date, Check In, Check Out, Status, Remarks
- Records sorted by date (newest first)

#### Test 4.5: Admin View All Attendance
**Steps:**
1. Login as admin
2. Navigate to Admin → Attendance Records

**Expected Result:**
- Can view attendance of all employees
- Can filter by employee and date range

### 5. Leave Management Tests

#### Test 5.1: Apply for Leave
**Steps:**
1. Login as employee
2. Navigate to Leave page
3. Click "Apply for Leave"
4. Fill in the form:
   - Leave Type: `Paid Leave`
   - Start Date: Select future date
   - End Date: Select future date (after start)
   - Reason: `Family event`
5. Click "Submit Leave Request"

**Expected Result:**
- Success message: "Leave request submitted successfully"
- Leave appears in "My Leave Requests" table
- Status shows "pending"

#### Test 5.2: View Leave Requests
**Steps:**
1. View the leave requests table

**Expected Result:**
- Shows all leave requests
- Displays Leave Type, Start Date, End Date, Reason, Status
- Status badge color-coded (Pending: yellow, Approved: green, Rejected: red)

#### Test 5.3: Approve Leave (Admin)
**Steps:**
1. Login as admin
2. Navigate to Admin → Leave Approvals
3. Find pending leave request
4. Click to approve
5. Add comment: `Approved`
6. Submit

**Expected Result:**
- Leave status changes to "approved"
- Approver comments saved
- Employee can see updated status

#### Test 5.4: Reject Leave (Admin)
**Steps:**
1. Login as admin
2. Find another pending leave
3. Reject with comment: `Insufficient leave balance`

**Expected Result:**
- Leave status changes to "rejected"
- Comment visible to employee

### 6. Payroll Tests

#### Test 6.1: View Payroll (No Data)
**Steps:**
1. Login as new employee
2. Navigate to Payroll page

**Expected Result:**
- Message: "No payroll information available"

#### Test 6.2: Create Payroll (Admin)
**Steps:**
1. Login as admin
2. Navigate to Admin → Payroll Management
3. Create payroll for employee:
   - Employee ID: `EMP001`
   - Basic Salary: `50000`
   - HRA: `10000`
   - Transport: `2000`
   - Tax: `5000`
   - PF: `2000`
4. Submit

**Expected Result:**
- Payroll created successfully
- Net salary calculated automatically: `55000`

#### Test 6.3: View Payroll (Employee)
**Steps:**
1. Login as employee
2. Navigate to Payroll page

**Expected Result:**
- Salary structure displayed
- Basic Salary shown
- Allowances listed with amounts
- Deductions listed with amounts
- Net Salary highlighted

#### Test 6.4: View All Payrolls (Admin)
**Steps:**
1. Login as admin
2. Navigate to Payroll Management
3. View all payrolls

**Expected Result:**
- List of all employees' payroll information
- Can filter and sort

### 7. Admin Dashboard Tests

#### Test 7.1: Admin Dashboard Access
**Steps:**
1. Login as admin
2. View dashboard

**Expected Result:**
- Admin-specific dashboard displayed
- Statistics cards showing:
  - Total Employees count
  - Pending Leave Requests count
- Admin menu cards visible

#### Test 7.2: Employee Management
**Steps:**
1. Navigate to Admin → Employees
2. View employee list

**Expected Result:**
- List of all employees displayed
- Can click to view/edit individual employees

#### Test 7.3: Statistics Update
**Steps:**
1. Create new employee
2. Return to admin dashboard

**Expected Result:**
- Total employees count increased

### 8. Authorization Tests

#### Test 8.1: Protected Routes
**Steps:**
1. Logout
2. Try to access protected URLs directly:
   - http://localhost:3000/dashboard
   - http://localhost:3000/profile
   - http://localhost:3000/attendance

**Expected Result:**
- Redirected to sign in page
- Cannot access without authentication

#### Test 8.2: Role-Based Access (Employee)
**Steps:**
1. Login as employee
2. Try to access admin endpoints via API:
   ```bash
   curl http://localhost:5000/api/employees/all \
     -H "Authorization: Bearer <employee_token>"
   ```

**Expected Result:**
- 403 Forbidden error
- Message: "Not authorized to access this resource"

#### Test 8.3: Role-Based Access (Admin)
**Steps:**
1. Login as admin
2. Access admin endpoints

**Expected Result:**
- All admin endpoints accessible
- Can perform admin operations

### 9. Data Validation Tests

#### Test 9.1: Email Format Validation
**Steps:**
1. Try to signup with invalid email: `notanemail`

**Expected Result:**
- Error: "Valid email is required"

#### Test 9.2: Password Length Validation
**Steps:**
1. Try to signup with short password: `123`

**Expected Result:**
- Error: "Password must be at least 6 characters"

#### Test 9.3: Required Fields
**Steps:**
1. Try to submit forms with empty required fields

**Expected Result:**
- HTML5 validation prevents submission
- "This field is required" messages

### 10. API Tests (Using cURL)

#### Test 10.1: Health Check
```bash
curl http://localhost:5000/health
```
**Expected Result:**
```json
{"status":"OK","message":"Server is running"}
```

#### Test 10.2: Signup API
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP002",
    "email": "jane@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "employee"
  }'
```

#### Test 10.3: Signin API
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Test 10.4: Protected Endpoint
```bash
# Get token from signin response, then:
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <your_token_here>"
```

## Test Checklist

- [ ] User signup (employee)
- [ ] User signup (admin)
- [ ] User signin
- [ ] Invalid login
- [ ] Employee dashboard access
- [ ] Profile view
- [ ] Profile edit
- [ ] Attendance check-in
- [ ] Attendance check-out
- [ ] Attendance history view
- [ ] Leave application
- [ ] Leave approval (admin)
- [ ] Leave rejection (admin)
- [ ] Payroll creation (admin)
- [ ] Payroll view (employee)
- [ ] Admin dashboard
- [ ] Employee list (admin)
- [ ] Protected routes
- [ ] Role-based authorization
- [ ] Email validation
- [ ] Password validation
- [ ] API health check
- [ ] Logout functionality

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots (if applicable)
5. Browser/environment details
6. Console errors

## Performance Testing

### Load Testing
Use tools like Apache Bench or Artillery:
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 http://localhost:5000/health
```

### Database Testing
Monitor MongoDB performance during tests:
```bash
# Connect to MongoDB
mongosh

# Use database
use dayflow-hrms

# Show collections
show collections

# Count documents
db.users.countDocuments()
db.employees.countDocuments()
db.attendance.countDocuments()
```

## Success Criteria

All tests should pass with:
- ✅ Correct functionality
- ✅ Appropriate error messages
- ✅ Proper authorization
- ✅ Data persistence
- ✅ UI responsiveness
- ✅ No console errors
- ✅ Fast response times (<500ms)

---
**Note**: This is a manual testing guide. Automated tests should be added for continuous integration.
