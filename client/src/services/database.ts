/// <reference types="vite/client" />

// Database Service Layer - Connected to Backend API
// All operations now call the Node.js/Express backend connected to MongoDB Atlas

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5002/api';

export interface User {
  id: string;
  _id?: string;
  employeeId: string;
  email: string;
  password?: string;
  role: 'employee' | 'admin';
  fullName: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeProfile {
  id?: string;
  _id?: string;
  userId?: string;
  fullName: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  department?: string;
  designation?: string;
  employmentType?: 'full-time' | 'part-time' | 'intern';
  joiningDate?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  salary?: number;
  bankAccountNumber?: string;
  bankIFSC?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  emergencyContact?: string;
  emergencyContactNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id?: string;
  _id?: string;
  employeeId: string;
  date: string | Date;
  checkIn?: string | Date;
  checkOut?: string | Date;
  checkInTime?: string | Date;
  checkOutTime?: string | Date;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaveRequest {
  id?: string;
  _id?: string;
  employeeId: string;
  userName?: string;
  leaveType: 'paid' | 'sick' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
  remarks?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

class DatabaseService {
  private token: string | null = null;

  initialize() {
    // Load token from localStorage if it exists
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      throw new Error('Unauthorized: Please login again');
    }

    return response;
  }


  // User operations
    async register(user: Omit<User, 'id'>): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          email: user.email,
          password: user.password,
          fullName: user.fullName,  // CHANGED: was 'name: user.fullName'
          role: user.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const data = await response.json();
      this.setToken(data.token);
      
      return {
        user: {
          id: data.user.id,
          employeeId: data.user.employeeId,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
          isEmailVerified: data.user.isEmailVerified,
        },
        token: data.token,
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      this.setToken(data.token);

      return {
        user: {
          id: data.user.id,
          employeeId: data.user.employeeId,
          email: data.user.email,
          fullName: data.user.fullName,
          role: data.user.role,
          isEmailVerified: data.user.isEmailVerified,
        },
        token: data.token,
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      return Array.isArray(data) ? data.map((u: any) => ({
        id: u._id || u.id,
        ...u,
      })) : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/users/${id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/users?email=${email}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }

      const data = await response.json();
      return {
        id: data.user?.id || data._id || data.id,
        ...data.user || data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/auth/users/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Profile operations
  async getAllProfiles(): Promise<EmployeeProfile[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/employees`);
      if (!response.ok) throw new Error('Failed to fetch profiles');
      const data = await response.json();
      return Array.isArray(data) ? data.map((p: any) => ({
        id: p._id || p.id,
        ...p,
      })) : [];
    } catch (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }
  }

  async getProfileById(id: string): Promise<EmployeeProfile | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/employees/${id}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async createProfile(profile: Omit<EmployeeProfile, 'id'>): Promise<EmployeeProfile> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create profile');
      }

      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(id: string, updates: Partial<EmployeeProfile>): Promise<EmployeeProfile | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  async deleteProfile(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/employees/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }

  // Attendance operations
  async getAllAttendance(): Promise<AttendanceRecord[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/attendance`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      return Array.isArray(data) ? data.map((a: any) => ({
        id: a._id || a.id,
        ...a,
      })) : [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  }

  async getAttendanceByUserId(userId: string): Promise<AttendanceRecord[]> {
    try {
      console.log('Fetching attendance for userId:', userId);
      const response = await this.fetchWithAuth(`${API_URL}/attendance/user/${userId}`);
      if (!response.ok) {
        console.warn('Failed to fetch attendance, status:', response.status);
        return [];
      }
      const data = await response.json();
      const records = Array.isArray(data) ? data.map((a: any) => {
        // Convert date from ISO to DD/MM/YYYY format for consistency
        const dateObj = new Date(a.date);
        const dateStr = `${String(dateObj.getUTCDate()).padStart(2, '0')}/${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}/${dateObj.getUTCFullYear()}`;
        
        return {
          id: a._id || a.id,
          ...a,
          date: dateStr,
        };
      }) : [];
      console.log('Fetched attendance records:', records);
      return records;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/attendance?date=${date}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data.map((a: any) => ({
        id: a._id || a.id,
        ...a,
      })) : [];
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  }

  async createAttendance(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
    try {
      console.log('Creating attendance with:', record);
      const response = await this.fetchWithAuth(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create attendance record');
      }

      const data = await response.json();
      const mappedRecord = {
        id: data._id || data.id,
        ...data,
      };
      console.log('Attendance created successfully:', mappedRecord);
      return mappedRecord;
    } catch (error) {
      console.error('Attendance creation error:', error);
      throw error;
    }
  }

  async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | null> {
    try {
      console.log('Updating attendance:', id, 'with:', updates);
      const response = await this.fetchWithAuth(`${API_URL}/attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Update attendance error:', error);
        return null;
      }
      const data = await response.json();
      const updatedRecord = {
        id: data._id || data.id,
        ...data,
      };
      console.log('Attendance updated successfully:', updatedRecord);
      return updatedRecord;
    } catch (error) {
      console.error('Error updating attendance:', error);
      return null;
    }
  }

  async deleteAttendance(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/attendance/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting attendance:', error);
      return false;
    }
  }

  // Leave operations
  async getAllLeaves(): Promise<LeaveRequest[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/leaves`);
      if (!response.ok) throw new Error('Failed to fetch leaves');
      const data = await response.json();
      return Array.isArray(data) ? data.map((l: any) => ({
        id: l._id || l.id,
        ...l,
      })) : [];
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }
  }

  async getLeavesByUserId(userId: string): Promise<LeaveRequest[]> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/leaves/employee/${userId}`);
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data.map((l: any) => ({
        id: l._id || l.id,
        ...l,
      })) : [];
    } catch (error) {
      console.error('Error fetching leaves:', error);
      return [];
    }
  }

  async createLeave(leave: Omit<LeaveRequest, 'id'>): Promise<LeaveRequest> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leave),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create leave request');
      }

      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateLeave(id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest | null> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return {
        id: data._id || data.id,
        ...data,
      };
    } catch (error) {
      console.error('Error updating leave:', error);
      return null;
    }
  }

  async deleteLeave(id: string): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(`${API_URL}/leaves/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting leave:', error);
      return false;
    }
  }

  // Logout
  logout() {
    this.clearToken();
  }
}

export const db = new DatabaseService();
