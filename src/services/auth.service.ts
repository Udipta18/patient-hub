import { useAuthStore } from '@/store/auth.store';
import type { User } from '@/types';

// Mock auth service - replace with real Supabase auth when connected
// This simulates authentication for frontend development

const MOCK_USER: User = {
  id: 'doctor-001',
  email: 'doctor@clinic.com',
  name: 'Dr. Sarah Johnson',
  role: 'doctor',
};

// Simulated delay for realistic UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Email/Password login
  async loginWithEmail(email: string, password: string): Promise<User> {
    await delay(1000);
    
    // Mock validation - in production, this comes from backend
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    // Simulate successful login
    const user = { ...MOCK_USER, email };
    const mockToken = `mock-jwt-${Date.now()}`;
    
    useAuthStore.getState().setToken(mockToken);
    useAuthStore.getState().setUser(user);
    
    return user;
  },

  // Magic Link (OTP) login
  async sendMagicLink(email: string): Promise<void> {
    await delay(1000);
    
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    // In production, this sends an email via Supabase
    console.log(`Magic link sent to ${email}`);
  },

  // Verify OTP code
  async verifyOTP(email: string, code: string): Promise<User> {
    await delay(1000);
    
    if (!code || code.length !== 6) {
      throw new Error('Invalid verification code');
    }

    // Simulate successful verification
    const user = { ...MOCK_USER, email };
    const mockToken = `mock-jwt-${Date.now()}`;
    
    useAuthStore.getState().setToken(mockToken);
    useAuthStore.getState().setUser(user);
    
    return user;
  },

  // Check current session
  async getSession(): Promise<User | null> {
    await delay(500);
    
    const token = useAuthStore.getState().token;
    if (token) {
      return useAuthStore.getState().user;
    }
    
    return null;
  },

  // Logout
  async logout(): Promise<void> {
    await delay(300);
    useAuthStore.getState().logout();
  },
};
