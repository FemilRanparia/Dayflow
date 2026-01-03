# Dayflow HRMS - Quick Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/FemilRanparia/Dayflow.git
cd Dayflow
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Setup Backend

#### Install backend dependencies:
```bash
cd backend
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=your_very_secure_secret_key_here_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important:** Change the `JWT_SECRET` to a secure random string in production.

### 4. Setup Frontend

```bash
cd ../frontend
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

#### Option A: Local MongoDB
```bash
# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux (systemd)
sudo systemctl start mongod

# On Windows
# Start MongoDB service from Services panel or run mongod.exe
```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

### 6. Run the Application

#### Option A: Run both frontend and backend together (Recommended)
From the root directory:
```bash
npm run dev
```

#### Option B: Run separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## Creating Your First User

### Option 1: Using the UI
1. Open http://localhost:3000
2. Click on "Sign Up"
3. Fill in the registration form:
   - Employee ID: `EMP001`
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `password123`
   - Role: Select `Admin` for first user
4. Click "Sign Up"

### Option 2: Using API (via cURL)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin"
  }'
```

## Testing the Features

### As Employee:
1. Sign in with your credentials
2. View Dashboard
3. Update Profile (phone, address)
4. Check-in for attendance
5. Apply for leave
6. View payroll (if set by admin)

### As Admin/HR:
1. Sign in with admin credentials
2. View all employees
3. Manage attendance records
4. Approve/reject leave requests
5. Set up payroll for employees

## Common Issues & Solutions

### Port Already in Use
If port 5000 or 3000 is already in use:

**Backend:**
Edit `backend/.env` and change `PORT=5000` to another port like `PORT=5001`

**Frontend:**
Create a `.env` file in frontend directory and add:
```
PORT=3001
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check if the connection string in `backend/.env` is correct
- For Atlas, ensure your IP is whitelisted

### Module Not Found Errors
Run `npm install` in both backend and frontend directories

### TypeScript Errors
Ensure TypeScript is installed:
```bash
npm install -g typescript
```

## Project Structure

```
Dayflow/
├── backend/               # Node.js/Express backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   └── index.ts      # Server entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Context providers
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main app
│   ├── package.json
│   └── tsconfig.json
│
├── README.md
├── API_DOCUMENTATION.md
└── package.json          # Root package
```

## Development Tips

### Backend Development
- Backend runs on http://localhost:5000
- Auto-reloads on file changes (nodemon)
- API endpoints start with `/api`

### Frontend Development
- Frontend runs on http://localhost:3000
- Auto-reloads on file changes (React hot reload)
- Proxy API requests to backend

### Database
- Database name: `dayflow-hrms`
- View data using MongoDB Compass or mongosh

## Next Steps

1. **Security:** Change JWT_SECRET to a secure value
2. **Email:** Integrate email service for notifications
3. **Admin Panel:** Create additional admin features
4. **Reports:** Add analytics and reporting
5. **Testing:** Add unit and integration tests

## Support

For issues or questions:
- Check the [README.md](README.md)
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Open an issue on GitHub

## License

ISC License - See LICENSE file for details
