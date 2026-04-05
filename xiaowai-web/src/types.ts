export interface ApiEnvelope<T> {
  code?: number;
  msg?: string;
  data: T;
}

export type Gender = 'unknown' | 'male' | 'female' | 'other';

export interface UserProfile {
  id: number;
  nickname: string;
  birthday?: string | null;
  avatar: string;
  gender: Gender;
  hobbies: string;
  signature: string;
  experience: number;
  updatedat: string;
}

export interface LoginResponse {
  token: string;
}

export interface ChatResponse {
  output: string;
}

export interface RegisterPayload {
  email: string;
  code: string;
  username: string;
  password: string;
  phone?: string;
}

export interface ProfilePayload {
  nickname: string;
  birthday?: string;
  avatar?: string;
  gender: Gender;
  hobbies: string;
  signature: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
