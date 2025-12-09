import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  artifacts?: any[];
}

export interface ConversationContext {
  sessionId: string;
  userId: string;
  appId?: string;
  history: Message[];
  currentSpec?: any;
  currentMLUseCase?: any;
}

export const conversationApi = {
  startSession: async (userId: string) => {
    const response = await api.post('/conversation/start', { userId });
    return response.data;
  },

  sendMessage: async (sessionId: string, message: string) => {
    const response = await api.post('/conversation/message', {
      sessionId,
      message,
    });
    return response.data;
  },

  getContext: async (sessionId: string) => {
    const response = await api.get(`/conversation/${sessionId}`);
    return response.data;
  },
};

export const appApi = {
  generateApp: async (sessionId: string) => {
    const response = await api.post('/apps/generate', { sessionId });
    return response.data;
  },
};

export const mlApi = {
  createUseCase: async (data: any) => {
    const response = await api.post('/ml/use-cases', data);
    return response.data;
  },

  trainModel: async (useCaseId: string, config: any) => {
    const response = await api.post(`/ml/use-cases/${useCaseId}/train`, { config });
    return response.data;
  },

  deployModel: async (modelId: string, useCaseId: string) => {
    const response = await api.post(`/ml/models/${modelId}/deploy`, { useCaseId });
    return response.data;
  },

  getModels: async (useCaseId: string) => {
    const response = await api.get(`/ml/use-cases/${useCaseId}/models`);
    return response.data;
  },
};

export const demoApi = {
  createAppWithML: async (userId: string, appDescription: string, mlUseCase?: string) => {
    const response = await api.post('/demo/create-app-with-ml', {
      userId,
      appDescription,
      mlUseCase,
    });
    return response.data;
  },
};

export default api;
