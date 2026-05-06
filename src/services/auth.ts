import ApiService from '@/services/api';
import type { RegistrationData } from '@/store/registration';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
}

class AuthService {
  static async register(data: RegistrationData): Promise<AuthResponse> {
    return ApiService.post<AuthResponse, RegistrationData>('/auth/register', data, {
      auth: false,
    });
  }

  static async changePassword(currentPassword: string, password: string) {
    return ApiService.post<{ message: string }, { current_password: string; password: string }>('/auth/password', {
      current_password: currentPassword,
      password,
    });
  }

  static async deleteAccount(confirmation: string) {
    return ApiService.post<{ message: string }, { confirmation: string }>('/auth/delete-account', {
      confirmation,
    });
  }

  static async getVerificationStatus() {
    return ApiService.get<{
      email: string;
      email_verified: boolean;
      email_verification_todo: boolean;
      phone?: string | null;
      phone_verification_enabled: boolean;
      mfa_enabled: boolean;
    }>('/verification/status');
  }

  static async resendEmailVerification() {
    return ApiService.post<{ message: string }>('/verification/email/resend');
  }
}

export default AuthService;
