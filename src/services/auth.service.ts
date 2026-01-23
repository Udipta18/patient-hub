import { useAuthStore } from '@/store/auth.store';
import { api } from './api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User } from '@/types';

// Backend API response types
interface VerifyTokenResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    role: 'doctor' | 'admin';
  };
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Email/Password login with Supabase
  async loginWithEmail(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using mock authentication');
      return this.mockLogin(email, password);
    }

    try {
      // Login with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('Login failed - no session created');
      }

      // Extract JWT token from Supabase session
      const token = data.session.access_token;

      // Verify token with backend and get user role
      const backendUser = await this.verifyTokenWithBackend(token);

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
        role: backendUser?.role || 'doctor', // Get role from backend
      };

      // Store token and user
      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error: any) {
      console.error('Supabase login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },

  // Sign up new user with Supabase
  async signUp(email: string, password: string, metadata?: { name?: string }): Promise<User> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please set up Supabase credentials.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Sign up failed');
      }

      // If email confirmation is required, session might be null
      if (!data.session) {
        throw new Error('Please check your email to confirm your account');
      }

      const token = data.session.access_token;
      const backendUser = await this.verifyTokenWithBackend(token);

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: metadata?.name || data.user.email?.split('@')[0] || 'User',
        role: backendUser?.role || 'doctor',
      };

      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error: any) {
      console.error('Supabase signup error:', error);
      throw new Error(error.message || 'Sign up failed');
    }
  },

  // Mock login for development (fallback when Supabase is not configured)
  async mockLogin(email: string, password: string): Promise<User> {
    await delay(1000);

    if (password.length < 6) {
      throw new Error('Invalid credentials');
    }

    const user: User = {
      id: 'mock-doctor-001',
      email,
      name: email.split('@')[0],
      role: 'doctor',
    };

    const mockToken = `mock-jwt-${Date.now()}`;

    useAuthStore.getState().setToken(mockToken);
    useAuthStore.getState().setUser(user);

    return user;
  },

  // Login with JWT token directly (for testing or external auth)
  async loginWithToken(token: string): Promise<User> {
    if (!token) {
      throw new Error('Token is required');
    }

    try {
      const user = await this.verifyTokenWithBackend(token);

      if (!user) {
        throw new Error('Invalid token');
      }

      useAuthStore.getState().setToken(token);
      useAuthStore.getState().setUser(user);

      return user;
    } catch (error) {
      throw new Error('Token verification failed');
    }
  },

  // Verify JWT token with backend
  async verifyTokenWithBackend(token: string): Promise<User | null> {
    try {
      const response = await api.post<VerifyTokenResponse>(
        '/auth/verify',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.valid && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.email.split('@')[0],
          role: response.user.role,
        };

        return user;
      }

      return null;
    } catch (error) {
      console.error('Backend token verification failed:', error);
      return null;
    }
  },

  // Get current Supabase session
  async getSession(): Promise<User | null> {
    // First check if we have a stored token
    const storedToken = useAuthStore.getState().token;

    // If using mock token, return cached user
    if (storedToken?.startsWith('mock-jwt-')) {
      return useAuthStore.getState().user;
    }

    // If Supabase is configured, get session from Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          const token = session.access_token;

          // Verify with backend
          const backendUser = await this.verifyTokenWithBackend(token);

          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: backendUser?.role || 'doctor',
          };

          // Update stored token and user
          useAuthStore.getState().setToken(token);
          useAuthStore.getState().setUser(user);

          return user;
        }
      } catch (error) {
        console.error('Failed to get Supabase session:', error);
      }
    }

    // If we have a stored token but no Supabase session, verify it with backend
    if (storedToken) {
      const user = await this.verifyTokenWithBackend(storedToken);
      if (user) {
        return user;
      }
    }

    // No valid session found
    useAuthStore.getState().logout();
    return null;
  },

  // Logout
  async logout(): Promise<void> {
    // Sign out from Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Supabase logout error:', error);
      }
    }

    // Clear local auth state
    await delay(300);
    useAuthStore.getState().logout();
  },

  // Password reset
  async resetPassword(email: string): Promise<void> {
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Password update error:', error);
      throw new Error(error.message || 'Failed to update password');
    }
  },
};
