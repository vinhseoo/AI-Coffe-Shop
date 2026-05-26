import { api } from './api';
import { useAuthStore } from '../store/authStore';
import { ApiResponse } from '../types/api';

interface AuthResponse {
  token: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email: string;
    fullName?: string;
    phone?: string;
    avatarUrl?: string;
    role: 'OWNER' | 'STAFF';
    active: boolean;
  };
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

// Ghi cookie để middleware có thể đọc (edge runtime không đọc được localStorage)
function setAuthCookies(token: string, role: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 7 * 24 * 60 * 60; // 7 ngày
  document.cookie = `auth-token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `user-role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth-token=; path=/; max-age=0';
  document.cookie = 'user-role=; path=/; max-age=0';
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/login', payload);
  const { token, user } = res.data;

  useAuthStore.getState().setCredentials(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.active,
    },
    token
  );
  setAuthCookies(token, user.role);

  return res.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<any, ApiResponse<AuthResponse>>('/auth/register', payload);
  const { token, user } = res.data;

  useAuthStore.getState().setCredentials(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.active,
    },
    token
  );
  setAuthCookies(token, user.role);

  return res.data;
}

export function logout() {
  useAuthStore.getState().logout();
  clearAuthCookies();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
