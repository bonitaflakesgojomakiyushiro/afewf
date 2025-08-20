export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: 'USER' | 'OFFICER';
  aadhaar_number?: string;
  address?: string;
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('auth_token');
};

export const setAuthData = (token: string, user: User) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(user));
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  localStorage.removeItem('login_user_id');
  localStorage.removeItem('pending_user_id');
  localStorage.removeItem('generated_user_id');
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return !!(getStoredToken() && getStoredUser());
};