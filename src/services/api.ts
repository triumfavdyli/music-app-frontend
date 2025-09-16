/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Song } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const songService = {
  getAllSongs: async (): Promise<Song[]> => {
    try {
      const response = await api.get('/songs');
      return response.data;
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw new Error('Failed to fetch songs');
    }
  },
  getExternalSongs: async (): Promise<any[]> => {
    try {
      const response = await api.get('/songs/external');
      return response.data;
    } catch (error) {
      console.error('Error fetching external songs:', error);
      throw new Error('Failed to fetch external songs');
    }
  },

  syncSongs: async (songs: any[]): Promise<void> => {
    try {
      await api.post('/songs/sync', songs);
    } catch (error) {
      console.error('Error syncing songs:', error);
      throw new Error('Failed to sync songs');
    }
  },
};

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  updateProfile: async (username: string, email: string, currentPassword?: string, newPassword?: string) => {
    const data: any = { username, email };
    if (currentPassword && newPassword) {
      data.currentPassword = currentPassword;
      data.newPassword = newPassword;
    }
    const response = await api.put('/auth/update-profile', data);
    return response.data;
  },
};
