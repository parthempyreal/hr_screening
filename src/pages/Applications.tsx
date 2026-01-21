import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Briefcase,
  Sparkles,
  Code,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  Zap,
  X,
  FileText,
  User
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Application } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Applications() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { applications, jobs, applicationFilters, setApplicationFilters, updateApplicationStatus } = useStore();
  
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Filter by job if jobId is provided
      if (jobId && app.jobId !== jobId) return false;
      
      // Filter by status
      if (applicationFilters.status !== 'all' && app.status !== applicationFilters.status) return false;
      
      // Filter by minimum score
      if (applicationFilters.minScore > 0 && app.matchScore < applicationFilters.minScore) return false;
      
      // Filter by search
      if (applicationFilters.search) {
        const searchLower = applicationFilters.search.toLowerCase();
        const matchesName = app.candidateName.toLowerCase().includes(searchLower);
        const matchesEmail = app.candidateEmail.toLowerCase().includes(searchLower);
        const matchesSkill = app.skills.some(s => s.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesEmail && !matchesSkill) return false;
      }
      
      // Filter by skills
      if (applicationFilters.skills.length > 0) {
        const hasAllSkills = applicationFilters.skills.every(skill => 
          app.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasAllSkills) return false;
      }
      
      return true;
    });
  }, [applications, jobId, applicationFilters]);

  // Get unique skills for filter
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    applications.forEach(app => app.skills.forEach(s => skills.add(s)));
    return Array.from(skills).sort();
  }, [applications]);

  const currentJob = jobId ? jobs.find(j => j.id === jobId) : null;

  const statusCounts = {
    all: applications.filter(a => !jobId || a.jobId === jobId).length,
    pending: applications.filter(a => (!jobId || a.jobId === jobId) && a.status === 'pending').length,
    reviewing: applications.filter(a => (!jobId || a.jobId === jobId) && a.status === 'reviewing').length,
    shortlisted: applications.filter(a => (!jobId || a.jobId === jobId) && a.status === 'shortlisted').length,
    accepted: applications.filter(a => (!jobId || a.jobId === jobId) && a.status === 'accepted').length,
    rejected: applications.filter(a => (!jobId || a.jobId === jobId) && a.status === 'rejected').length,
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-info"><Clock className="w-3 h-3 mr-1" />Pending</span>;
      case 'reviewing':
        return <span className="badge badge-warning"><Eye className="w-3 h-3 mr-1" />Reviewing</span>;
      case 'shortlisted':
        return <span className="badge badge-success"><CheckCircle2 className="w-3 h-3 mr-1" />Shortlisted</span>;
      case 'accepted':
        return <span className="badge badge-success"><CheckCircle2 className="w-3 h-3 mr-1" />Accepted</span>;
      case 'rejected':
        return <span className="badge badge-danger"><XCircle className="w-3 h-3 mr-1" />Rejected</span>;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 60) return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  const toggleSkillFilter = (skill: string) => {
    const current = applicationFilters.skills;
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill];
    setApplicationFilters({ skills: updated });
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
          <div className="flex items-center gap-2 mb-2">
            {currentJob && (
              <button
                onClick={() => navigate('/applications')}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                All Applications
              </button>
            )}
            {currentJob && <span className="text-dark-500">/</span>}
          </div>
          <h1 className="font-display text-3xl font-bold text-dark-50">
            {currentJob ? currentJob.title : 'All Applications'}
          </h1>
          <p className="text-dark-400 mt-1">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} 
            {currentJob && ` for ${currentJob.title}`}
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={applicationFilters.search}
              onChange={(e) => setApplicationFilters({ search: e.target.value })}
              className="input-field"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-dark-800/50 rounded-xl overflow-x-auto">
            {(['all', 'pending', 'reviewing', 'shortlisted'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setApplicationFilters({ status })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  applicationFilters.status === status
                    ? 'bg-primary-500/20 text-primary-300'
                    : 'text-dark-400 hover:text-dark-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-1.5 text-xs opacity-60">({statusCounts[status]})</span>
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-500/20 border-primary-500/30' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {applicationFilters.skills.length > 0 && (
              <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-xs flex items-center justify-center">
                {applicationFilters.skills.length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 mt-6 border-t border-dark-700/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Minimum Match Score */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">
                      Minimum Match Score: <span className="text-primary-400">{applicationFilters.minScore}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={applicationFilters.minScore}
                      onChange={(e) => setApplicationFilters({ minScore: parseInt(e.target.value) })}
                      className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-dark-500 mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-3">
                      Filter by Skills
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {allSkills.slice(0, 15).map((skill) => (
                        <button
                          key={skill}
                          onClick={() => toggleSkillFilter(skill)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            applicationFilters.skills.includes(skill)
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700/50 text-dark-300 hover:bg-dark-600/50'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {(applicationFilters.skills.length > 0 || applicationFilters.minScore > 0) && (
                  <button
                    onClick={() => setApplicationFilters({ skills: [], minScore: 0 })}
                    className="mt-4 text-sm text-primary-400 hover:text-primary-300"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredApplications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card hover-card cursor-pointer"
            onClick={() => setSelectedApplication(application)}
          >
            <div className="flex items-start gap-6">
              {/* Avatar & Match Score */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl font-semibold text-primary-300 border border-primary-500/20">
                  {application.candidateName.charAt(0)}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br ${getMatchScoreColor(application.matchScore)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                  {application.matchScore}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-dark-50">
                      {application.candidateName}
                    </h3>
                    <p className="text-sm text-dark-400">{application.jobTitle}</p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>

                {/* Contact & Details */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {application.candidateEmail}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {application.experience} years exp
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {application.education.split(',')[0]}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* AI Extracted Skills */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <span className="text-xs font-medium text-primary-400">AI-Extracted Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {application.skills.slice(0, 6).map((skill) => (
                      <span 
                        key={skill} 
                        className={`skill-tag ${applicationFilters.skills.includes(skill) ? 'bg-primary-500/30 border-primary-400/40' : ''}`}
                      >
                        {skill}
                      </span>
                    ))}
                    {application.skills.length > 6 && (
                      <span className="text-xs text-dark-400">+{application.skills.length - 6} more</span>
                    )}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-accent-400" />
                    <span className="text-xs font-medium text-accent-400">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {application.techStack.slice(0, 5).map((tech) => (
                      <span key={tech} className="px-2.5 py-1 bg-accent-500/10 text-accent-300 rounded-lg text-xs border border-accent-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Match Score Badge */}
              <div className="hidden lg:flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50">
                  <Zap className={`w-4 h-4 ${
                    application.matchScore >= 80 ? 'text-emerald-400' :
                    application.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`} />
                  <span className="text-sm font-medium text-dark-200">
                    {application.matchScore}% Match
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-dark-800/50 flex items-center justify-center">
            <Search className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="font-display text-xl font-semibold text-dark-200 mb-2">
            No applications found
          </h3>
          <p className="text-dark-400">
            Try adjusting your filters to see more results
          </p>
        </motion.div>
      )}

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto glass rounded-3xl border border-dark-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 glass border-b border-dark-700/50 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl font-semibold text-primary-300 border border-primary-500/20">
                        {selectedApplication.candidateName.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br ${getMatchScoreColor(selectedApplication.matchScore)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                        {selectedApplication.matchScore}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-dark-50">
                        {selectedApplication.candidateName}
                      </h2>
                      <p className="text-dark-400">{selectedApplication.jobTitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-dark-800/30 rounded-xl">
                    <Mail className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-dark-400">Email</p>
                      <p className="text-dark-100">{selectedApplication.candidateEmail}</p>
                    </div>
                  </div>
                  {selectedApplication.candidatePhone && (
                    <div className="flex items-center gap-3 p-4 bg-dark-800/30 rounded-xl">
                      <Phone className="w-5 h-5 text-primary-400" />
                      <div>
                        <p className="text-xs text-dark-400">Phone</p>
                        <p className="text-dark-100">{selectedApplication.candidatePhone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-dark-800/30 rounded-xl">
                    <Briefcase className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-dark-400">Experience</p>
                      <p className="text-dark-100">{selectedApplication.experience} years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-dark-800/30 rounded-xl">
                    <GraduationCap className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-xs text-dark-400">Education</p>
                      <p className="text-dark-100 text-sm">{selectedApplication.education}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-dark-400" />
                    <h3 className="font-semibold text-dark-100">About</h3>
                  </div>
                  <p className="text-dark-300 leading-relaxed">
                    {selectedApplication.description}
                  </p>
                </div>

                {/* AI Extracted Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    <h3 className="font-semibold text-dark-100">AI-Extracted Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Code className="w-5 h-5 text-accent-400" />
                    <h3 className="font-semibold text-dark-100">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.techStack.map((tech) => (
                      <span key={tech} className="px-3 py-1.5 bg-accent-500/10 text-accent-300 rounded-lg text-sm border border-accent-500/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume */}
                <div className="p-4 bg-dark-800/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-dark-100">Resume</p>
                      <p className="text-sm text-dark-400">{selectedApplication.candidateName.replace(' ', '-').toLowerCase()}-resume.pdf</p>
                    </div>
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Modal Footer - Actions */}
              <div className="sticky bottom-0 glass border-t border-dark-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-400">Current Status</p>
                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'rejected');
                        setSelectedApplication({ ...selectedApplication, status: 'rejected' });
                      }}
                      className="px-6 py-3 bg-rose-500/10 text-rose-400 font-semibold rounded-xl border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'shortlisted');
                        setSelectedApplication({ ...selectedApplication, status: 'shortlisted' });
                      }}
                      className="px-6 py-3 bg-amber-500/10 text-amber-400 font-semibold rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, 'accepted');
                        setSelectedApplication({ ...selectedApplication, status: 'accepted' });
                      }}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
