import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database';

// Load env vars
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import employeeRoutes from './routes/employee';
import attendanceRoutes from './routes/attendance';
import leaveRoutes from './routes/leave';
import payrollRoutes from './routes/payroll';

// Connect to database
connectDB();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
