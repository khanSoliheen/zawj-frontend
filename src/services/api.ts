import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ApiError } from '@/interface/api';

const API_TOKEN_KEY = '@session_token';

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const getMetroHost = () => {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.platform?.hostUri;
  return hostUri?.split(':')[0] ?? null;
};

const resolveBaseUrl = () => {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080';
    }

    return 'http://localhost:8080';
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(configuredBaseUrl);
  } catch {
    return trimTrailingSlash(configuredBaseUrl);
  }

  const isLocalHost =
    parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1';

  if (Platform.OS === 'web' || !isLocalHost) {
    return trimTrailingSlash(parsedUrl.toString());
  }

  const metroHost = getMetroHost();
  if (metroHost) {
    parsedUrl.hostname = metroHost;
    return trimTrailingSlash(parsedUrl.toString());
  }

  if (Platform.OS === 'android') {
    parsedUrl.hostname = '10.0.2.2';
  }

  return trimTrailingSlash(parsedUrl.toString());
};

const BASE_URL = resolveBaseUrl();
const WS_BASE_URL = BASE_URL.replace(/^http/i, 'ws');

type RequestOptions = RequestInit & {
  auth?: boolean;
};

class ApiService {
  static async getToken() {
    return AsyncStorage.getItem(API_TOKEN_KEY);
  }

  static async setToken(token: string | null) {
    if (!token) {
      await AsyncStorage.removeItem(API_TOKEN_KEY);
      return;
    }

    await AsyncStorage.setItem(API_TOKEN_KEY, token);
  }

  private static async getHeaders(options: RequestOptions = {}): Promise<HeadersInit> {
    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json');

    if (options.auth !== false) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let message = 'Something went wrong';
      try {
        const error = (await response.json()) as ApiError;
        message = error.message || message;
      } catch {
        message = response.statusText || message;
      }
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  static async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = await this.getHeaders(options);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  static async post<T, TBody = unknown>(
    endpoint: string,
    data?: TBody,
    options: RequestOptions = {},
  ): Promise<T> {
    const headers = await this.getHeaders(options);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  static async put<T, TBody = unknown>(
    endpoint: string,
    data: TBody,
    options: RequestOptions = {},
  ): Promise<T> {
    const headers = await this.getHeaders(options);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const headers = await this.getHeaders(options);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }
}

export { API_TOKEN_KEY, BASE_URL, WS_BASE_URL };
export default ApiService;
