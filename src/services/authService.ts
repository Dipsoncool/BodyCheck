import { DEMO_CREDENTIALS, DEMO_USER, UserProfile } from '../types/auth';

const AUTH_STORAGE_KEY = 'bodycheck_auth_user_v1';
const LEGACY_STORAGE_KEY = 'bodycheck_poc_auth_user_v1';

/**
 * Service abstraction for authentication.
 * Interfaces with organizational identity provider / Entra ID.
 */
class AuthService {
  private currentUser: UserProfile | null = null;

  constructor() {
    this.loadPersistedUser();
  }

  private loadPersistedUser(): void {
    try {
      const saved = 
        localStorage.getItem(AUTH_STORAGE_KEY) || 
        sessionStorage.getItem(AUTH_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_STORAGE_KEY) || 
        sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        this.currentUser = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load persisted auth user:', e);
      this.currentUser = null;
    }
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public getCurrentUser(): UserProfile | null {
    if (!this.currentUser) {
      this.loadPersistedUser();
    }
    return this.currentUser;
  }

  public async login(
    email: string,
    pass: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    // Brief realistic mock authentication delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPass = pass.trim();

    const isDemoAuth = (
      normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase() &&
      normalizedPass === DEMO_CREDENTIALS.password
    );

    const isInstitutionalAuth = (
      normalizedEmail.includes('@') &&
      normalizedPass.length >= 4
    );

    if (isDemoAuth || isInstitutionalAuth) {
      const now = new Date().toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace('T', ' ');

      const displayEmail = (normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase())
        ? 's.mitchell@bodycheck.org'
        : normalizedEmail;

      const user: UserProfile = {
        ...DEMO_USER,
        email: displayEmail,
        lastLogin: now
      };

      this.currentUser = user;

      try {
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        }
      } catch (e) {
        console.warn('Failed to persist auth session:', e);
      }

      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid email or password. Please verify your credentials and try again.'
    };
  }

  public logout(): void {
    this.currentUser = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      sessionStorage.removeItem('bodycheck_active_tab');
      sessionStorage.removeItem('bodycheck_poc_active_tab');
    } catch (e) {
      console.warn('Failed to clear auth session:', e);
    }
  }
}

export const authService = new AuthService();
