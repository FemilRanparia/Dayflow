import api from './api';
import { AuthResponse, User, Employee } from '../types';

export const authService = {
  signup: async (data: {
    employeeId: string;
    email: string;
    password: string;
    role?: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  signin: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signin', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User; employee: Employee }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
