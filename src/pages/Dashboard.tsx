import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { getStats, jobs, applications, user, fetchJobs } = useStore();
  const stats = getStats();
  const navigate = useNavigate();

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const statCards = [
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      total: stats.totalJobs,
      icon: Briefcase,
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-500/10',
      textColor: 'text-primary-400',
      change: '+3 this week'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'from-sky-500 to-sky-600',
      bgColor: 'bg-sky-500/10',
      textColor: 'text-sky-400',
      change: '+12 today'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
      change: 'Needs attention'
    },
    {
      title: 'Avg. Match Score',
      value: `${stats.avgMatchScore}%`,
      icon: Target,
      color: 'from-accent-500 to-accent-600',
      bgColor: 'bg-accent-500/10',
      textColor: 'text-accent-400',
      change: '+5% from last month'
    }
  ];

  const recentApplications = applications.slice(0, 5);
  const activeJobs = jobs.filter(j => j.status === 'active').slice(0, 3);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-dark-50">
            Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'}!
          </h1>
          <p className="text-dark-400 mt-1">
            Here's what's happening with your hiring pipeline today.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-primary-300 text-sm font-medium">AI Active</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="card hover-card cursor-pointer"
            onClick={() => navigate(stat.title.includes('Job') ? '/jobs' : '/applications')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm mb-1">{stat.title}</p>
              <p className="font-display text-3xl font-bold text-dark-50 stat-number" style={{ animationDelay: `${index * 100}ms` }}>
                {stat.value}
                {stat.total && (
                  <span className="text-lg text-dark-400 font-normal">/{stat.total}</span>
                )}
              </p>
              <p className="text-sm text-dark-500 mt-2">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-dark-50">Recent Applications</h2>
                <p className="text-dark-400 text-sm">Latest candidates across all jobs</p>
              </div>
              <button 
                onClick={() => navigate('/applications')}
                className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:border-dark-600/50 transition-all cursor-pointer"
                  onClick={() => navigate('/applications')}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-primary-300 font-semibold border border-primary-500/20">
                    {app.candidateName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-100 truncate">{app.candidateName}</p>
                    <p className="text-sm text-dark-400 truncate">{app.jobTitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        app.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                        app.matchScore >= 60 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        <Zap className="w-3 h-3" />
                        {app.matchScore}% Match
                      </div>
                    </div>
                    <span className={`badge ${
                      app.status === 'shortlisted' ? 'badge-success' :
                      app.status === 'reviewing' ? 'badge-warning' :
                      app.status === 'pending' ? 'badge-info' :
                      app.status === 'accepted' ? 'badge-success' :
                      'badge-danger'
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Active Jobs */}
        <motion.div variants={itemVariants}>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-semibold text-dark-50">Active Jobs</h2>
                <p className="text-dark-400 text-sm">Currently hiring</p>
              </div>
              <button 
                onClick={() => navigate('/jobs')}
                className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors text-sm font-medium"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {activeJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/30 hover:border-primary-500/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/applications/${job.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-dark-100 group-hover:text-primary-300 transition-colors">
                      {job.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-dark-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-dark-400 mb-3">
                    <span>{job.location}</span>
                    <span className="w-1 h-1 bg-dark-500 rounded-full"></span>
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-dark-500" />
                      <span className="text-sm text-dark-400">{job.applicationsCount} applicants</span>
                    </div>
                    <span className="badge badge-success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/jobs/create')}
              className="w-full mt-4 btn-secondary flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Post New Job
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Insights Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900/50 to-accent-900/30 border border-primary-500/20 p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center glow-teal">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-dark-50 mb-1">
                AI-Powered Insights Ready
              </h3>
              <p className="text-dark-300 max-w-xl">
                We've analyzed your job posts and found potential skill gaps. View detailed recommendations to improve candidate matching.
              </p>
            </div>
          </div>
          <button className="btn-primary flex items-center gap-2 flex-shrink-0">
            View Insights
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
