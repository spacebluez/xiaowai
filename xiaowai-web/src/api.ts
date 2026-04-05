import { ApiEnvelope, ChatResponse, LoginResponse, ProfilePayload, RegisterPayload, UserProfile } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`请求失败: ${response.status}`);
  }

  const data = (await response.json()) as ApiEnvelope<T> | { msg?: string };
  const code = 'code' in data ? data.code : response.ok ? 0 : response.status;

  if (!response.ok || code !== 0) {
    throw new Error(data.msg || `请求失败: ${response.status}`);
  }

  return data as ApiEnvelope<T>;
}

export async function request<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  return parseResponse<T>(response);
}

export const api = {
  sendCode: (email: string) =>
    request<null>('/verification/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  register: (payload: RegisterPayload) =>
    request<null>('/user/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { username: string; password: string }) =>
    request<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request<null>('/user/logout', {
      method: 'POST',
    }),
  getProfile: () => request<UserProfile>('/user/profile'),
  updateProfile: (payload: ProfilePayload) =>
    request<UserProfile>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  updateAvatar: (formData: FormData) =>
    request<null>('/user/avatar', {
      method: 'PUT',
      body: formData,
    }),
  chat: (input: string) =>
    request<ChatResponse>('/user/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ input }),
    }),
};

export function assetUrl(path: string) {
  const base = API_BASE_URL.replace(/\/api\/v1$/, '');
  return `${base}${path}`;
}

export function avatarUrl(userId?: number) {
  if (!userId) {
    return '';
  }
  return assetUrl(`/api/v1/user/${userId}/avatar`);
}
