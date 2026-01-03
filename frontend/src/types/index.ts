export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: 'employee' | 'hr' | 'admin';
  isEmailVerified?: boolean;
}

export interface Employee {
  _id: string;
  userId: string;
  employeeId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
  };
  jobDetails: {
    designation?: string;
    department?: string;
    joiningDate?: string;
    employmentType?: string;
  };
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: string;
  }>;
}

export interface Attendance {
  _id: string;
  employeeId: string;
  userId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  remarks?: string;
}

export interface Leave {
  _id: string;
  employeeId: string;
  userId: string;
  leaveType: 'paid' | 'sick' | 'unpaid';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approverComments?: string;
  createdAt: string;
}

export interface Payroll {
  _id: string;
  employeeId: string;
  userId: string;
  basicSalary: number;
  allowances: {
    hra?: number;
    transport?: number;
    medical?: number;
    other?: number;
  };
  deductions: {
    tax?: number;
    providentFund?: number;
    insurance?: number;
    other?: number;
  };
  netSalary: number;
  effectiveFrom: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}
