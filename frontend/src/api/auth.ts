import api from '../utils/api';

export const register = async (userData: { username: string; password: string }) => {
  const res = await api.post(`/auth/register`, userData);
  return res.data;
};

export const login = async (userData: { username: string; password: string }) => {
  const res = await api.post(`auth/login`, userData);
  return res.data;
};