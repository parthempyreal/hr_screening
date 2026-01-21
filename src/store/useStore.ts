import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Job, Application, DashboardStats } from '../types';
import api, { Job as ApiJob } from '../services/api';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, company?: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Jobs
  jobs: Job[];
  jobsLoading: boolean;
  fetchJobs: (params?: { status?: string; search?: string }) => Promise<void>;
  addJob: (jobData: { title: string; description: string; location: string; type?: string; salaryMin?: number; salaryMax?: number }) => Promise<Job | null>;
  updateJobStatus: (jobId: string, status: Job['status']) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  
  // Applications (still mock for now)
  applications: Application[];
  updateApplicationStatus: (applicationId: string, status: Application['status']) => void;
  
  // Filters
  jobFilters: {
    status: string;
    search: string;
  };
  applicationFilters: {
    status: string;
    skills: string[];
    minScore: number;
    search: string;
  };
  setJobFilters: (filters: Partial<AppState['jobFilters']>) => void;
  setApplicationFilters: (filters: Partial<AppState['applicationFilters']>) => void;

  // Stats
  getStats: () => DashboardStats;
}

// Helper to convert API job to local Job type
function apiJobToLocal(apiJob: ApiJob): Job {
  return {
    id: apiJob._id,
    title: apiJob.title,
    description: apiJob.description,
    location: apiJob.location,
    type: apiJob.type,
    salary: {
      min: apiJob.salaryMin,
      max: apiJob.salaryMax,
      currency: 'USD'
    },
    skills: apiJob.skills,
    techStack: apiJob.techStack,
    requirements: apiJob.requirements,
    benefits: [],
    status: apiJob.status,
    applicationsCount: apiJob.applicationsCount,
    createdAt: new Date(apiJob.createdAt),
    updatedAt: new Date(apiJob.updatedAt),
    recruiterId: apiJob.createdBy._id
  };
}

// Mock applications (until we build applications API)
const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Senior Full Stack Developer',
    candidateName: 'Alex Thompson',
    candidateEmail: 'alex.thompson@email.com',
    candidatePhone: '+1 (555) 123-4567',
    resumeUrl: '/resumes/alex-thompson.pdf',
    description: 'Experienced developer with 7 years in full-stack development.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL', 'MongoDB', 'GraphQL'],
    techStack: ['React', 'Next.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
    experience: 7,
    education: 'MS Computer Science, Stanford University',
    matchScore: 92,
    status: 'shortlisted',
    appliedAt: new Date('2025-01-16'),
  },
  {
    id: '2',
    jobId: '1',
    jobTitle: 'Senior Full Stack Developer',
    candidateName: 'Sarah Chen',
    candidateEmail: 'sarah.chen@email.com',
    resumeUrl: '/resumes/sarah-chen.pdf',
    description: 'Full stack developer passionate about building scalable applications.',
    skills: ['React', 'Python', 'TypeScript', 'GCP', 'PostgreSQL', 'Redis'],
    techStack: ['React', 'Django', 'PostgreSQL', 'GCP', 'Kubernetes'],
    experience: 5,
    education: 'BS Computer Science, MIT',
    matchScore: 78,
    status: 'reviewing',
    appliedAt: new Date('2025-01-17'),
  },
  {
    id: '3',
    jobId: '1',
    jobTitle: 'Senior Full Stack Developer',
    candidateName: 'Marcus Johnson',
    candidateEmail: 'marcus.j@email.com',
    resumeUrl: '/resumes/marcus-johnson.pdf',
    description: 'Backend-focused developer transitioning to full-stack.',
    skills: ['Node.js', 'Java', 'PostgreSQL', 'AWS', 'Microservices'],
    techStack: ['Spring Boot', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    experience: 6,
    education: 'BS Software Engineering, Georgia Tech',
    matchScore: 65,
    status: 'pending',
    appliedAt: new Date('2025-01-18'),
  },
  {
    id: '4',
    jobId: '2',
    jobTitle: 'Machine Learning Engineer',
    candidateName: 'Dr. Emily Wang',
    candidateEmail: 'emily.wang@email.com',
    resumeUrl: '/resumes/emily-wang.pdf',
    description: 'PhD in Machine Learning with focus on NLP.',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Deep Learning', 'MLOps'],
    techStack: ['Python', 'TensorFlow', 'Hugging Face', 'MLflow', 'AWS SageMaker'],
    experience: 4,
    education: 'PhD Machine Learning, Carnegie Mellon',
    matchScore: 96,
    status: 'shortlisted',
    appliedAt: new Date('2025-01-14'),
  },
  {
    id: '5',
    jobId: '2',
    jobTitle: 'Machine Learning Engineer',
    candidateName: 'James Miller',
    candidateEmail: 'james.miller@email.com',
    resumeUrl: '/resumes/james-miller.pdf',
    description: 'Data scientist transitioning to ML engineering.',
    skills: ['Python', 'Scikit-learn', 'TensorFlow', 'SQL', 'Statistics'],
    techStack: ['Python', 'Scikit-learn', 'Pandas', 'Jupyter', 'Databricks'],
    experience: 3,
    education: 'MS Data Science, UC Berkeley',
    matchScore: 58,
    status: 'pending',
    appliedAt: new Date('2025-01-15'),
  },
  {
    id: '6',
    jobId: '3',
    jobTitle: 'DevOps Engineer',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@email.com',
    resumeUrl: '/resumes/david-kim.pdf',
    description: 'DevOps specialist with extensive experience in cloud infrastructure.',
    skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Python', 'CI/CD'],
    techStack: ['AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'Prometheus'],
    experience: 5,
    education: 'BS Computer Engineering, UCLA',
    matchScore: 88,
    status: 'reviewing',
    appliedAt: new Date('2025-01-12'),
  },
  {
    id: '7',
    jobId: '1',
    jobTitle: 'Senior Full Stack Developer',
    candidateName: 'Lisa Rodriguez',
    candidateEmail: 'lisa.r@email.com',
    resumeUrl: '/resumes/lisa-rodriguez.pdf',
    description: 'Frontend specialist expanding to full-stack.',
    skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Testing', 'Node.js'],
    techStack: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Vercel'],
    experience: 4,
    education: 'BS Computer Science, University of Washington',
    matchScore: 72,
    status: 'pending',
    appliedAt: new Date('2025-01-19'),
  },
  {
    id: '8',
    jobId: '2',
    jobTitle: 'Machine Learning Engineer',
    candidateName: 'Michael Park',
    candidateEmail: 'michael.park@email.com',
    resumeUrl: '/resumes/michael-park.pdf',
    description: 'ML engineer with focus on computer vision.',
    skills: ['Python', 'PyTorch', 'Computer Vision', 'CUDA', 'C++', 'Docker'],
    techStack: ['PyTorch', 'OpenCV', 'TensorRT', 'ONNX', 'Docker'],
    experience: 4,
    education: 'MS Computer Vision, ETH Zurich',
    matchScore: 84,
    status: 'reviewing',
    appliedAt: new Date('2025-01-16'),
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.login(email, password);
          if (response.success && response.data) {
            const user: User = {
              id: response.data.user._id,
              email: response.data.user.email,
              name: response.data.user.name,
              company: response.data.user.company || '',
              role: response.data.user.role,
              createdAt: new Date(response.data.user.createdAt),
            };
            set({ 
              user, 
              token: response.data.token,
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, company?: string) => {
        set({ isLoading: true });
        try {
          const response = await api.register(email, password, name, company);
          if (response.success && response.data) {
            const user: User = {
              id: response.data.user._id,
              email: response.data.user.email,
              name: response.data.user.name,
              company: response.data.user.company || '',
              role: response.data.user.role,
              createdAt: new Date(response.data.user.createdAt),
            };
            set({ 
              user, 
              token: response.data.token,
              isAuthenticated: true, 
              isLoading: false 
            });
            return true;
          }
          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        api.logout();
        set({ user: null, token: null, isAuthenticated: false, jobs: [] });
      },

      checkAuth: async () => {
        const token = api.getToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            const user: User = {
              id: response.data.user._id,
              email: response.data.user.email,
              name: response.data.user.name,
              company: response.data.user.company || '',
              role: response.data.user.role,
              createdAt: new Date(response.data.user.createdAt),
            };
            set({ user, isAuthenticated: true });
          }
        } catch {
          api.logout();
          set({ isAuthenticated: false, user: null, token: null });
        }
      },

      // Jobs
      jobs: [],
      jobsLoading: false,
      
      fetchJobs: async (params) => {
        set({ jobsLoading: true });
        try {
          const response = await api.getJobs(params);
          if (response.success && response.data) {
            const jobs = response.data.jobs.map(apiJobToLocal);
            set({ jobs, jobsLoading: false });
          }
        } catch (error) {
          console.error('Fetch jobs error:', error);
          set({ jobsLoading: false });
        }
      },
      
      addJob: async (jobData) => {
        try {
          const response = await api.createJob(jobData);
          if (response.success && response.data) {
            const newJob = apiJobToLocal(response.data.job);
            set(state => ({ jobs: [newJob, ...state.jobs] }));
            return newJob;
          }
          return null;
        } catch (error) {
          console.error('Add job error:', error);
          throw error;
        }
      },
      
      updateJobStatus: async (jobId, status) => {
        try {
          const response = await api.updateJob(jobId, { status });
          if (response.success && response.data) {
            const updatedJob = apiJobToLocal(response.data.job);
            set(state => ({
              jobs: state.jobs.map(job => 
                job.id === jobId ? updatedJob : job
              )
            }));
          }
        } catch (error) {
          console.error('Update job status error:', error);
          throw error;
        }
      },

      deleteJob: async (jobId) => {
        try {
          await api.deleteJob(jobId);
          set(state => ({
            jobs: state.jobs.filter(job => job.id !== jobId)
          }));
        } catch (error) {
          console.error('Delete job error:', error);
          throw error;
        }
      },

      // Applications (mock)
      applications: mockApplications,
      
      updateApplicationStatus: (applicationId, status) => {
        set(state => ({
          applications: state.applications.map(app =>
            app.id === applicationId ? { ...app, status } : app
          )
        }));
      },

      // Filters
      jobFilters: {
        status: 'all',
        search: '',
      },
      applicationFilters: {
        status: 'all',
        skills: [],
        minScore: 0,
        search: '',
      },
      
      setJobFilters: (filters) => {
        set(state => ({ jobFilters: { ...state.jobFilters, ...filters } }));
      },
      
      setApplicationFilters: (filters) => {
        set(state => ({ applicationFilters: { ...state.applicationFilters, ...filters } }));
      },

      // Stats
      getStats: () => {
        const { jobs, applications } = get();
        const activeJobs = jobs.filter(j => j.status === 'active').length;
        const pendingReviews = applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length;
        const acceptedCandidates = applications.filter(a => a.status === 'accepted').length;
        const avgMatchScore = applications.length > 0 
          ? Math.round(applications.reduce((sum, a) => sum + a.matchScore, 0) / applications.length)
          : 0;
        
        return {
          totalJobs: jobs.length,
          activeJobs,
          totalApplications: applications.length,
          pendingReviews,
          acceptedCandidates,
          avgMatchScore,
        };
      },
    }),
    {
      name: 'ats-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
