import ApiService from '@/services/api';
import type { RegistrationData } from '@/store/registration';

export type ProfileResponse = {
  id: string;
  email: string;
  email_verified: boolean;
  avatar_url?: string | null;
  avatar_locked?: boolean;
  photo_access_status?: 'approved' | 'pending' | 'rejected' | 'hidden' | null;
  photo_access_notice?: string | null;
  is_online?: boolean;
  interested?: boolean;
} & RegistrationData;

export type UpdateProfilePayload = {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  location?: string;
  profession?: string;
  city?: string;
  state?: string;
  country?: string;
  designation?: string;
  department?: string;
  education?: string;
};

export type AvatarUploadPayload = {
  file_name: string;
  content_type: string;
  base64_data: string;
};

export type AvatarUploadResponse = {
  avatar_url: string;
};

export type UserCard = {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  city: string;
  education: string;
  employment_type: string;
  designation: string;
  department: string;
  marital_status: string;
  children_count?: string | null;
  prayer_regularity: string;
  quran_level: string;
  hijab_or_beard: string;
  avatar_url?: string | null;
  is_online?: boolean;
  interested?: boolean;
};

class UserService {
  static async getMyProfile() {
    return ApiService.get<ProfileResponse>('/users/me/profile');
  }

  static async updateMyProfile(payload: UpdateProfilePayload) {
    return ApiService.put<ProfileResponse, UpdateProfilePayload>('/users/me/profile', payload);
  }

  static async uploadMyAvatar(payload: AvatarUploadPayload) {
    return ApiService.post<AvatarUploadResponse, AvatarUploadPayload>('/users/me/avatar', payload);
  }

  static async deleteMyAvatar() {
    return ApiService.delete<void>('/users/me/avatar');
  }

  static async getUsers(params: {
    from?: number;
    limit?: number;
    q?: string;
  } = {}) {
    const search = new URLSearchParams();

    if (params.from !== undefined) {
      search.set('from', String(params.from));
    }
    if (params.limit !== undefined) {
      search.set('limit', String(params.limit));
    }
    if (params.q?.trim()) {
      search.set('q', params.q.trim());
    }

    const suffix = search.size > 0 ? `?${search.toString()}` : '';
    return ApiService.get<UserCard[]>(`/users${suffix}`);
  }

  static async getUser(userId: string) {
    return ApiService.get<ProfileResponse>(`/users/${userId}`);
  }

  static async expressInterest(userId: string) {
    return ApiService.post<{ interested: boolean }>(`/users/${userId}/interest`);
  }

  static async removeInterest(userId: string) {
    return ApiService.delete<{ interested: boolean }>(`/users/${userId}/interest`);
  }
}

export default UserService;
