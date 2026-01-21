import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Users,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  Code,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Job } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Jobs() {
  const { jobs, jobFilters, setJobFilters, updateJobStatus, fetchJobs, jobsLoading, deleteJob } = useStore();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    if (jobFilters.status !== 'all' && job.status !== jobFilters.status) return false;
    if (jobFilters.search && !job.title.toLowerCase().includes(jobFilters.search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    paused: jobs.filter(j => j.status === 'paused').length,
    closed: jobs.filter(j => j.status === 'closed').length,
  };

  const getStatusBadge = (status: Job['status']) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success"><CheckCircle2 className="w-3 h-3 mr-1" />Active</span>;
      case 'paused':
        return <span className="badge badge-warning"><Pause className="w-3 h-3 mr-1" />Paused</span>;
      case 'closed':
        return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" />Closed</span>;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-50">Job Posts</h1>
          <p className="text-dark-400 mt-1">Manage your job listings and track applications</p>
        </div>
        <button 
          onClick={() => navigate('/jobs/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Job Post
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobFilters.search}
              onChange={(e) => setJobFilters({ search: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 p-1 bg-dark-800/50 rounded-xl">
            {(['all', 'active', 'paused', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setJobFilters({ status })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  jobFilters.status === status
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs opacity-60">({statusCounts[status]})</span>
              </button>
            ))}
          </div>

          <button className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </motion.div>

      {/* Jobs Grid */}
      {jobsLoading ? (
        <motion.div variants={itemVariants} className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
            <p className="text-dark-400">Loading jobs...</p>
          </div>
        </motion.div>
      ) : filteredJobs.length === 0 ? (
        <motion.div variants={itemVariants} className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-dark-400 mb-4">No jobs found</p>
            <button 
              onClick={() => navigate('/jobs/create')}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Your First Job
            </button>
          </div>
        </motion.div>
      ) : (
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover-card group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(job.status)}
                  <span className="text-xs text-dark-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-dark-50 group-hover:text-primary-300 transition-colors">
                  {job.title}
                </h3>
              </div>
              
              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === job.id ? null : job.id)}
                  className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {activeMenu === job.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-dark-700/50 py-2 z-10"
                  >
                    <button 
                      onClick={() => navigate(`/applications/${job.id}`)}
                      className="w-full px-4 py-2 text-left text-sm text-dark-200 hover:bg-dark-700/50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Applications
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-dark-200 hover:bg-dark-700/50 flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </button>
                    {job.status === 'active' ? (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'paused')}
                        className="w-full px-4 py-2 text-left text-sm text-amber-400 hover:bg-dark-700/50 flex items-center gap-2"
                      >
                        <Pause className="w-4 h-4" />
                        Pause Job
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateJobStatus(job.id, 'active')}
                        className="w-full px-4 py-2 text-left text-sm text-emerald-400 hover:bg-dark-700/50 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Activate Job
                      </button>
                    )}
                    <button 
                      onClick={() => updateJobStatus(job.id, 'closed')}
                      className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-dark-700/50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Close Job
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Job Details */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-dark-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
              </div>
              {job.salary && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  ${(job.salary.min / 1000).toFixed(0)}K - ${(job.salary.max / 1000).toFixed(0)}K
                </div>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-dark-400 text-sm mb-4 line-clamp-2">
              {job.description}
            </p>

            {/* AI Extracted Skills */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-medium text-primary-400">AI-Extracted Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.skills.slice(0, 5).map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
                {job.skills.length > 5 && (
                  <span className="text-xs text-dark-400 flex items-center">
                    +{job.skills.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-accent-400" />
                <span className="text-xs font-medium text-accent-400">Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {job.techStack.slice(0, 4).map((tech) => (
                  <span key={tech} className="px-2.5 py-1 bg-accent-500/10 text-accent-300 rounded-lg text-xs border border-accent-500/20">
                    {tech}
                  </span>
                ))}
                {job.techStack.length > 4 && (
                  <span className="text-xs text-dark-400 flex items-center">
                    +{job.techStack.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-300">
                  <span className="font-semibold text-dark-100">{job.applicationsCount}</span> applicants
                </span>
              </div>
              <button 
                onClick={() => navigate(`/applications/${job.id}`)}
                className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
              >
                View Applications →
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      )}
    </motion.div>
  );
}
