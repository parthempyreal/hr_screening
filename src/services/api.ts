const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Load token from localStorage on init
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.errors?.join(', ') || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, company?: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, company }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Job endpoints
  async createJob(jobData: CreateJobData) {
    return this.request<{ job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async getJobs(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      searchParams.append('status', params.status);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const query = searchParams.toString();
    return this.request<{ jobs: Job[]; pagination: Pagination }>(`/jobs${query ? `?${query}` : ''}`);
  }

  async getJob(id: string) {
    return this.request<{ job: Job }>(`/jobs/${id}`);
  }

  async updateJob(id: string, updates: Partial<Job>) {
    return this.request<{ job: Job }>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string) {
    return this.request<void>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }
}

// Types
export interface User {
  _id: string;
  email: string;
  name: string;
  company?: string;
  role: 'recruiter' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salaryMin: number;
  salaryMax: number;
  status: 'active' | 'paused' | 'closed';
  skills: string[];
  techStack: string[];
  requirements: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  location: string;
  type?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

export default api;
