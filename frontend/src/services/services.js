import api from './api';

// Authentication Services
export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token, password) => {
        const response = await api.put(`/auth/reset-password/${token}`, { password });
        return response.data;
    },
};

// User Services
export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await api.put('/users/profile', userData);
        return response.data;
    },

    uploadProfilePicture: async (file) => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        const response = await api.post('/users/profile-picture', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    uploadDocument: async (file, name, type) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('name', name);
        formData.append('type', type);
        const response = await api.post('/users/documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    deleteDocument: async (documentId) => {
        const response = await api.delete(`/users/documents/${documentId}`);
        return response.data;
    },

    getAllEmployees: async () => {
        const response = await api.get('/users/employees');
        return response.data;
    },

    getEmployeeById: async (id) => {
        const response = await api.get(`/users/employees/${id}`);
        return response.data;
    },

    updateEmployee: async (id, userData) => {
        const response = await api.put(`/users/employees/${id}`, userData);
        return response.data;
    },

    deleteEmployee: async (id) => {
        const response = await api.delete(`/users/employees/${id}`);
        return response.data;
    },
};

// Attendance Services
export const attendanceService = {
    checkIn: async () => {
        const response = await api.post('/attendance/check-in');
        return response.data;
    },

    checkOut: async () => {
        const response = await api.post('/attendance/check-out');
        return response.data;
    },

    getMyAttendance: async (startDate, endDate) => {
        const response = await api.get('/attendance/my-attendance', {
            params: { startDate, endDate },
        });
        return response.data;
    },

    getTodayAttendance: async () => {
        const response = await api.get('/attendance/today');
        return response.data;
    },

    getAllAttendance: async (params) => {
        const response = await api.get('/attendance/all', { params });
        return response.data;
    },

    updateAttendance: async (id, data) => {
        const response = await api.put(`/attendance/${id}`, data);
        return response.data;
    },

    getAttendanceStats: async (userId) => {
        const response = await api.get('/attendance/stats', {
            params: { userId },
        });
        return response.data;
    },
};

// Leave Services
export const leaveService = {
    applyLeave: async (leaveData) => {
        const response = await api.post('/leaves', leaveData);
        return response.data;
    },

    getMyLeaves: async () => {
        const response = await api.get('/leaves/my-leaves');
        return response.data;
    },

    getAllLeaves: async (params) => {
        const response = await api.get('/leaves', { params });
        return response.data;
    },

    getLeaveById: async (id) => {
        const response = await api.get(`/leaves/${id}`);
        return response.data;
    },

    updateLeaveStatus: async (id, status, hrComments) => {
        const response = await api.put(`/leaves/${id}/status`, {
            status,
            hrComments,
        });
        return response.data;
    },

    cancelLeave: async (id) => {
        const response = await api.delete(`/leaves/${id}`);
        return response.data;
    },

    getLeaveStats: async (userId) => {
        const response = await api.get('/leaves/stats', {
            params: { userId },
        });
        return response.data;
    },
};

// Report Services
export const reportService = {
    exportAttendance: async (params) => {
        try {
            const response = await api.get('/reports/attendance', {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Attendance export failed:', error);
            throw error;
        }
    },

    exportLeaves: async (params) => {
        try {
            const response = await api.get('/reports/leaves', {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leave-report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Leave export failed:', error);
            throw error;
        }
    },

    exportPayroll: async (params) => {
        try {
            const response = await api.get('/reports/payroll', {
                params,
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payroll-report-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Payroll export failed:', error);
            throw error;
        }
    },

    getDashboardStats: async () => {
        const response = await api.get('/reports/dashboard-stats');
        return response.data;
    },
};
