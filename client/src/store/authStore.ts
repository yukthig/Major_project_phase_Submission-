import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '@/types';
import api from '@/services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          if (data.success) {
            set({
              user: data.data,
              token: data.data.token,
              isAuthenticated: true,
            });
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data));
            toast.success('Login successful!');
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Login failed');
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          if (data.success) {
            toast.success('Registration successful! Please login.');
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.success('Logged out successfully');
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({ user, token, isAuthenticated: true });
          } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
