export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  company?: string;
  role: 'recruiter';
  createdAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[];
  techStack: string[];
  requirements: string[];
  benefits: string[];
  status: 'active' | 'paused' | 'closed';
  applicationsCount: number;
  createdAt: Date;
  updatedAt: Date;
  recruiterId: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl: string;
  description: string;
  skills: string[];
  techStack: string[];
  experience: number;
  education: string;
  matchScore: number;
  status: 'pending' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
  appliedAt: Date;
  notes?: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingReviews: number;
  acceptedCandidates: number;
  avgMatchScore: number;
}
