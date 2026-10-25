export interface UserProfile {
  name: string;
  role: string;
  email: string;
  facility: string;
  lastLogin?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
}

export const DEMO_USER: UserProfile = {
  name: 'Sarah Mitchell',
  role: 'Reviewer',
  email: 's.mitchell@bodycheck.org',
  facility: 'Care & Wellbeing Unit',
};

export const DEMO_CREDENTIALS = {
  email: 'demo@bodycheck.test',
  password: 'Demo123!',
};
