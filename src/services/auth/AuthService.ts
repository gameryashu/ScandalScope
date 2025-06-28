import { User, AuthResult, SignUpData } from '@/types/auth';

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(userData: SignUpData): Promise<AuthResult>;
  signOut(): Promise<void>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<User | null>;
  isAuthenticated(): boolean;
}

export class AuthServiceImpl implements AuthService {
  private static instance: AuthServiceImpl;
  private currentUser: User | null = null;
  private token: string | null = null;

  static getInstance(): AuthServiceImpl {
    if (!AuthServiceImpl.instance) {
      AuthServiceImpl.instance = new AuthServiceImpl();
    }
    return AuthServiceImpl.instance;
  }

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
    try {
      const storedToken = localStorage.getItem('scandalscope_token');
      const storedUser = localStorage.getItem('scandalscope_user');
      
      if (storedToken && storedUser) {
        this.token = storedToken;
        this.currentUser = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      this.clearStoredAuth();
    }
  }

  private storeAuth(user: User, token: string) {
    localStorage.setItem('scandalscope_token', token);
    localStorage.setItem('scandalscope_user', JSON.stringify(user));
    this.currentUser = user;
    this.token = token;
  }

  private clearStoredAuth() {
    localStorage.removeItem('scandalscope_token');
    localStorage.removeItem('scandalscope_user');
    this.currentUser = null;
    this.token = null;
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      // For demo purposes, simulate API call
      await this.simulateApiDelay();

      // Mock authentication logic
      if (email === 'demo@scandalscope.com' && password === 'demo123') {
        const user: User = {
          id: 'demo-user-1',
          email,
          username: 'Demo User',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          totalAnalyses: 42,
          averageScore: 35,
          badges: ['early-adopter', 'safe-poster'],
          streak: 7,
          joinDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // 30 days ago
          lastActive: Date.now(),
          preferences: {
            roastIntensity: 'medium',
            notifications: true,
            publicProfile: false,
            shareResults: true,
            theme: 'dark',
            language: 'en',
          },
          stats: {
            totalWords: 15420,
            highestScore: 78,
            lowestScore: 12,
            favoriteCategories: ['mild', 'moderate'],
            analysisFrequency: {
              daily: 2,
              weekly: 14,
              monthly: 60,
            },
            achievements: [],
          },
        };

        const token = this.generateMockToken();
        this.storeAuth(user, token);

        return {
          success: true,
          user,
          token,
        };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  async signUp(userData: SignUpData): Promise<AuthResult> {
    try {
      // Validate input
      this.validateSignUpData(userData);

      // Simulate API call
      await this.simulateApiDelay();

      // Check if user already exists (mock)
      if (userData.email === 'demo@scandalscope.com') {
        throw new Error('An account with this email already exists');
      }

      // Create new user
      const user: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        username: userData.username,
        avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=150`,
        totalAnalyses: 0,
        averageScore: 0,
        badges: ['newcomer'],
        streak: 0,
        joinDate: Date.now(),
        lastActive: Date.now(),
        preferences: {
          roastIntensity: 'medium',
          notifications: true,
          publicProfile: false,
          shareResults: true,
          theme: 'dark',
          language: 'en',
        },
        stats: {
          totalWords: 0,
          highestScore: 0,
          lowestScore: 0,
          favoriteCategories: [],
          analysisFrequency: {
            daily: 0,
            weekly: 0,
            monthly: 0,
          },
          achievements: [],
        },
      };

      const token = this.generateMockToken();
      this.storeAuth(user, token);

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signOut(): Promise<void> {
    this.clearStoredAuth();
    
    // In a real app, you might want to invalidate the token on the server
    // await this.invalidateTokenOnServer(this.token);
  }

  async refreshToken(): Promise<string> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    // Simulate token refresh
    await this.simulateApiDelay();
    
    const newToken = this.generateMockToken();
    this.token = newToken;
    localStorage.setItem('scandalscope_token', newToken);
    
    return newToken;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!(this.currentUser && this.token);
  }

  private validateSignUpData(data: SignUpData): void {
    if (!data.email || !data.password || !data.username) {
      throw new Error('All fields are required');
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (data.username.length < 2) {
      throw new Error('Username must be at least 2 characters long');
    }

    if (data.username.length > 30) {
      throw new Error('Username must be less than 30 characters');
    }

    // Check for valid username characters
    if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateApiDelay(): Promise<void> {
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export singleton instance
export const authService = AuthServiceImpl.getInstance();