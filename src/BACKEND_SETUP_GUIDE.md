# How to Add MongoDB Atlas Backend

## Current Architecture
```
Frontend (React) → Service Layer → localStorage
```

## Target Architecture
```
Frontend (React) → API Calls → Backend (Node.js/Express) → MongoDB Atlas
```

## Step-by-Step Setup

### 1. Create Backend Server (Separate Project)

You need to create a **separate backend project**:

```bash
# Create backend folder
mkdir dayflow-backend
cd dayflow-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon typescript @types/express @types/node
```

### 2. Backend File Structure

```
dayflow-backend/
├── .env                    # MongoDB URI goes here
├── server.js              # Main server file
├── models/
│   ├── User.js
│   ├── EmployeeProfile.js
│   ├── Attendance.js
│   └── Leave.js
├── routes/
│   ├── auth.js
│   ├── employees.js
│   ├── attendance.js
│   └── leaves.js
└── package.json
```

### 3. Where MongoDB URI Goes

**⚠️ IMPORTANT: MongoDB URI goes in BACKEND, NOT frontend!**

**Backend `.env` file:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayflow?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

**Never put MongoDB URI in frontend code - it's a security risk!**

### 4. Create Backend Server

**`server.js`:**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### 5. Create MongoDB Models

**`models/User.js`:**
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash this!
  role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
  name: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

**`models/EmployeeProfile.js`:**
```javascript
const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
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
  emergencyContactNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);
```

### 6. Create API Routes

**`routes/employees.js`:**
```javascript
const express = require('express');
const router = express.Router();
const EmployeeProfile = require('../models/EmployeeProfile');

// GET all employees
router.get('/', async (req, res) => {
  try {
    const employees = await EmployeeProfile.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET employee by ID
router.get('/:id', async (req, res) => {
  try {
    const employee = await EmployeeProfile.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create employee
router.post('/', async (req, res) => {
  try {
    const employee = new EmployeeProfile(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await EmployeeProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await EmployeeProfile.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 7. Update Frontend Service Layer

**Update `/services/database.ts` to call APIs instead of localStorage:**

```typescript
// Replace localStorage with API calls
const API_URL = 'http://localhost:5000/api'; // or your deployed backend URLī

class DatabaseService {
  // Users
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`);
    return response.json();
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async deleteUser(id: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }

  // ... similar for profiles, attendance, leaves
}

export const db = new DatabaseService();
```

### 8. Environment Variables in Frontend

**Create `.env` in frontend root:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Use in code:**
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

### 9. Get MongoDB Atlas URI

1. Go to https://mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database credentials
7. Add database name: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/dayflow`

### 10. Run Both Projects

**Terminal 1 (Backend):**
```bash
cd dayflow-backend
node server.js
# Server running on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd dayflow-frontend
npm run dev
# App running on http://localhost:5173
```

## Security Notes

⚠️ **NEVER:**
- Put MongoDB URI in frontend code
- Commit `.env` file to Git
- Expose API keys in client-side code

✅ **ALWAYS:**
- Keep MongoDB URI in backend `.env`
- Add `.env` to `.gitignore`
- Use environment variables
- Hash passwords with bcrypt
- Use JWT for authentication

## Quick Start Commands

```bash
# 1. Clone/setup backend
mkdir dayflow-backend
cd dayflow-backend
npm init -y
npm install express mongoose cors dotenv bcrypt jsonwebtoken

# 2. Create .env file
echo "MONGODB_URI=your_mongodb_atlas_uri_here" > .env
echo "PORT=5000" >> .env
echo "JWT_SECRET=your_secret_key" >> .env

# 3. Create server.js and routes (copy from above)

# 4. Start backend
node server.js

# 5. Update frontend service layer to use API calls

# 6. Start frontend
npm run dev
```

## Summary

**MongoDB URI Location:**
- ✅ Backend `.env` file
- ❌ Frontend code (NEVER)

**Current Status:**
- Frontend exists (what I built)
- Backend needs to be created (what you need to do)
- MongoDB Atlas account needed (sign up at mongodb.com)

**Next Steps:**
1. Create MongoDB Atlas account
2. Get connection string
3. Build backend server (Node.js/Express)
4. Connect backend to MongoDB
5. Update frontend to call backend APIs
