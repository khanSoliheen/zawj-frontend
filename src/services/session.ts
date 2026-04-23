import ApiService from '@/services/api';
import AuthService from '@/services/auth';
import type { RegistrationData } from '@/store/registration';

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  email: string | null;
  userMetadata: Record<string, unknown>;
}

export interface SessionInfo {
  token: string;
  user: {
    id: string;
    email: string;
    user_metadata: Record<string, unknown>;
  };
}

export type SignOutScope = 'local' | 'global' | 'others';

type Listener = (user: SessionUser | null) => void;

const listeners = new Set<Listener>();

const mapUser = (
  user:
    | {
        id: string;
        email: string;
        user_metadata?: Record<string, unknown>;
      }
    | null
    | undefined,
): SessionUser | null => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    userMetadata:
      user.user_metadata && typeof user.user_metadata === 'object'
        ? user.user_metadata
        : {},
  };
};

const emit = (user: SessionUser | null) => {
  listeners.forEach((listener) => listener(user));
};

class SessionService {
  static async getCurrentUser(): Promise<SessionUser | null> {
    const token = await ApiService.getToken();
    if (!token) {
      return null;
    }

    try {
      const user = await ApiService.get<{
        id: string;
        email: string;
        user_metadata?: Record<string, unknown>;
      }>('/auth/me');
      return mapUser(user);
    } catch {
      await ApiService.setToken(null);
      return null;
    }
  }

  static async getSession(): Promise<{ access_token: string } | null> {
    const token = await ApiService.getToken();
    return token ? { access_token: token } : null;
  }

  static async signIn(credentials: SignInCredentials): Promise<SessionUser | null> {
    const response = await ApiService.post<SessionInfo, SignInCredentials>(
      '/auth/login',
      credentials,
      { auth: false },
    );
    await ApiService.setToken(response.token);
    const user = mapUser(response.user);
    emit(user);
    return user;
  }

  static async register(data: RegistrationData): Promise<SessionUser | null> {
    const response = await AuthService.register(data);
    await ApiService.setToken(response.token);
    const user = mapUser(response.user);
    emit(user);
    return user;
  }

  static async signOut(scope: SignOutScope = 'local'): Promise<void> {
    const token = await ApiService.getToken();
    if (!token) {
      emit(null);
      return;
    }

    try {
      await ApiService.post<{ message: string }, { scope: SignOutScope }>('/auth/logout', { scope });
    } finally {
      if (scope !== 'others') {
        await ApiService.setToken(null);
        emit(null);
      }
    }
  }

  static async deleteAccount(confirmation: string): Promise<void> {
    await AuthService.deleteAccount(confirmation);
    await ApiService.setToken(null);
    emit(null);
  }

  static onAuthStateChange(callback: (user: SessionUser | null) => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  }
}

export default SessionService;
