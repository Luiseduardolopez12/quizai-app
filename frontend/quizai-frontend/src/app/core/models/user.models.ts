export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
}