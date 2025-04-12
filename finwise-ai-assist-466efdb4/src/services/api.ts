
import axios from 'axios';
import { User } from '../models/user';
import { Transaction } from '../models/transaction';
import { Budget } from '../models/budget';
import { SavingsGoal } from '../models/goal';
import { AiTip, ChatMessage } from '../models/aiTip';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finWiseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the complete API object
export const api = {
  // Auth methods
  login: async (email: string, password: string): Promise<User> => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;
      // Make sure token is being stored
      if (token) {
        localStorage.setItem('finWiseToken', token);
        // Set token in axios defaults
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  register: async (userData: { name: string; email: string; password: string }): Promise<User> => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('finWiseToken', token);
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  getUserProfile: async (): Promise<User> => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
    }
  },

  // Transaction methods
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await axiosInstance.get('/user/transactions');
      return response.data.map((transaction: any) => ({
        ...transaction,
        date: new Date(transaction.date),
        createdAt: new Date(transaction.createdAt)
      }));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  },

  addTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    try {
      const response = await axiosInstance.post('/user/transactions', transaction);
      return {
        ...response.data,
        date: new Date(response.data.date),
        createdAt: new Date(response.data.createdAt)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to add transaction');
    }
  },

  // Budget methods
  getBudgets: async (): Promise<Budget[]> => {
    try {
      const response = await axiosInstance.get('/user/budgets');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
      throw error;
    }
  },

  createBudget: async (budget: Partial<Budget>): Promise<Budget> => {
    try {
      const response = await axiosInstance.post('/user/budgets', budget);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create budget');
    }
  },

  // Goals methods
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    try {
      const response = await axiosInstance.get('/user/goals');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      return [];
    }
  },

  createSavingsGoal: async (goal: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      const response = await axiosInstance.post('/user/goals', goal);
      // Transform dates from ISO strings to Date objects
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        deadline: response.data.deadline ? new Date(response.data.deadline) : undefined
      };
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to create goal');
    }
  },

  updateSavingsGoal: async (goalId: string, amount: number): Promise<SavingsGoal> => {
    try {
      const response = await axiosInstance.patch(`/user/goals/${goalId}`, { amount });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update goal');
    }
  },

  // AI Tips and Chat methods
  getAiTips: async (): Promise<AiTip[]> => {
    try {
      // Return dummy data temporarily until backend is ready
      return [
        {
          id: 'tip1',
          userId: 'user1',
          content: 'Consider setting up an emergency fund.',
          category: 'savings',
          createdAt: new Date(),
          isRead: false,
          relevanceScore: 0.9
        }
      ];
    } catch (error) {
      console.error('Failed to fetch AI tips:', error);
      return [];
    }
  },

  getChatHistory: async (): Promise<ChatMessage[]> => {
    try {
      const response = await axiosInstance.get('/user/chat/history');
      return response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch chat history');
    }
  },

  sendChatMessage: async (message: string): Promise<{ userMessage: ChatMessage, aiResponse: ChatMessage }> => {
    try {
      const response = await axiosInstance.post('/user/chat', { message });
      return {
        userMessage: {
          ...response.data.userMessage,
          timestamp: new Date(response.data.userMessage.timestamp)
        },
        aiResponse: {
          ...response.data.aiResponse,
          timestamp: new Date(response.data.aiResponse.timestamp)
        }
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to send message');
    }
  },

  
};
