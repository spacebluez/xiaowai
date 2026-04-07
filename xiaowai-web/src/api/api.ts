const API_BASE_URL = 'http://localhost:8080/api/v1';

// 通用请求函数
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.msg || '请求失败');
  }
  
  return response.json();
}

// 用户相关API
export const userApi = {
  // 注册
  register: async (data: {
    email: string;
    code: string;
    username: string;
    password: string;
    phone?: string;
  }) => {
    return request<{ data: any; msg: string }>('/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 登录
  login: async (data: {
    username: string;
    password: string;
  }) => {
    return request<{ data: { token: string }; msg: string }>('/user/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 登出
  logout: async () => {
    return request<{ data: any; msg: string }>('/user/logout', {
      method: 'POST',
    });
  },
  
  // 获取用户资料
  getProfile: async () => {
    return request<{ data: any; msg: string }>('/user/profile', {
      method: 'GET',
    });
  },
  
  // 更新用户资料
  updateProfile: async (data: {
    nickname: string;
    birthday?: string;
    avatar?: string;
    gender: string;
    hobbies?: string;
    signature?: string;
  }) => {
    return request<{ data: any; msg: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // 更新头像
  updateAvatar: async (formData: FormData) => {
    return fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || '请求失败');
      }
      return response.json();
    });
  },
  
  // 预览头像
  previewAvatar: async (userId: number) => {
    return `${API_BASE_URL}/user/${userId}/avatar`;
  },
};

// 验证码相关API
export const verificationApi = {
  // 发送验证码
  sendCode: async (data: {
    email: string;
  }) => {
    return request<{ data: any; msg: string }>('/verification/send-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 智能体相关API
export const agentApi = {
  // 与智能体聊天
  chatAgent: async (data: {
    agent_id: number;
    session_id: number;
    content: string;
    createdAt: string;
  }) => {
    return request<{ data: any; msg: string }>('/user/agent/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 创建智能体
  createAgent: async (data: {
    name: string;
    model_name: string;
    persona: string;
  }) => {
    return request<{ data: any; msg: string }>('/user/agent/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 获取智能体列表
  getAgentList: async () => {
    return request<{ data: { agents: any[] }; msg: string }>('/user/agent/list', {
      method: 'GET',
    });
  },
  
  // 更新智能体
  updateAgent: async (data: {
    agent_id: number;
    name: string;
    model_name: string;
    persona: string;
  }) => {
    return request<{ data: any; msg: string }>('/user/agent/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // 删除智能体
  deleteAgent: async (data: {
    agent_id: number;
  }) => {
    return request<{ data: any; msg: string }>('/user/agent/delete', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 会话相关API
export const sessionApi = {
  // 获取会话列表
  getSessionList: async () => {
    return request<{ data: { session_list: any[] }; msg: string }>('/user/session/list', {
      method: 'GET',
    });
  },
  
  // 创建会话
  createSession: async (data: {
    agent_id: number;
  }) => {
    return request<{ data: { session: any }; msg: string }>('/user/session/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
