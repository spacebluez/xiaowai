// 通用响应类型
export interface ApiResponse<T = any> {
  data: T;
  msg: string;
}

// 用户相关类型
export interface RegisterRequest {
  email: string;
  code: string;
  username: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ProfileRequest {
  nickname: string;
  birthday?: string;
  avatar?: string;
  gender: string;
  hobbies?: string;
  signature?: string;
}

export interface LoginData {
  token: string;
}

export interface UserProfileData {
  id: number;
  nickname: string;
  birthday?: string;
  avatar: string;
  gender: string;
  hobbies: string;
  signature: string;
  experience: number;
  updatedat: string;
}

// 验证码相关类型
export interface SendCodeRequest {
  email: string;
}

// 智能体相关类型
export interface ChatAgentRequest {
  agent_id: number;
  session_id: number;
  content: string;
  createdAt: string;
}

export interface ChatAgentResponse {
  session_id: number;
  role: string;
  content: string;
  createdAt: string;
}

export interface CreateAgentRequest {
  name: string;
  model_name: string;
  persona: string;
}

export interface UpdateAgentRequest {
  agent_id: number;
  name: string;
  model_name: string;
  persona: string;
}

export interface DeleteAgentRequest {
  agent_id: number;
}

export interface Agent {
  id: number;
  name: string;
  model_name: string;
  persona: string;
  created_at: string;
  updated_at: string;
}

export interface AgentListResponse {
  agents: Agent[];
}

// 会话相关类型
export interface CreateSessionRequest {
  agent_id: number;
}

export interface Session {
  id: number;
  user_id: number;
  agent_id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionResponse {
  session: Session;
}

export interface GetSessionListResponse {
  session_list: Session[];
}
