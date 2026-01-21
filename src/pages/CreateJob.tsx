import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStore } from '../store/useStore';

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

export default function CreateJob() {
  const navigate = useNavigate();
  const addJob = useStore(state => state.addJob);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'full-time' as const,
    salaryMin: '',
    salaryMax: '',
    description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;
  const isDescriptionValid = wordCount >= 200;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!isDescriptionValid) {
      newErrors.description = `Description must be at least 200 words (currently ${wordCount} words)`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setIsAnalyzing(true);
    setErrors({});
    
    try {
      // Create job via API (AI extraction happens on the server)
      const result = await addJob({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        type: formData.type,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      });
      
      setIsAnalyzing(false);
      
      if (result) {
        navigate('/jobs');
      }
    } catch (error) {
      setIsAnalyzing(false);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create job' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-dark-400 hover:text-dark-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>
        <h1 className="font-display text-3xl font-bold text-dark-50">Create Job Post</h1>
        <p className="text-dark-400 mt-1">
          Fill in the details below. Our AI will automatically extract skills and tech stack.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
        {/* API Error */}
        {errors.submit && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errors.submit}
          </motion.div>
        )}

        {/* Basic Info Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-100">Basic Information</h2>
              <p className="text-sm text-dark-400">Job title and employment details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Full Stack Developer"
                className={`input-field ${errors.title ? 'border-rose-500/50' : ''}`}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., San Francisco, CA or Remote"
                className={`input-field ${errors.location ? 'border-rose-500/50' : ''}`}
              />
              {errors.location && (
                <p className="mt-2 text-sm text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Employment Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Salary Min (USD)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleChange}
                placeholder="100000"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                Salary Max (USD)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleChange}
                placeholder="150000"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Job Description Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="font-semibold text-dark-100">Job Description</h2>
              <p className="text-sm text-dark-400">Detailed description (minimum 200 words)</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-dark-300">
                Description <span className="text-rose-400">*</span>
              </label>
              <span className={`text-sm ${isDescriptionValid ? 'text-emerald-400' : 'text-dark-400'}`}>
                {wordCount}/200 words
                {isDescriptionValid && <CheckCircle2 className="w-4 h-4 inline ml-1" />}
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={12}
              placeholder="Write a comprehensive job description including:

• Role overview and responsibilities
• Required skills and qualifications
• Technical requirements and tech stack
• Team structure and reporting
• Benefits and perks
• Company culture and values

Our AI will automatically extract skills, tech stack, and requirements from this description."
              className={`input-field resize-none ${errors.description ? 'border-rose-500/50' : ''}`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isDescriptionValid ? 'bg-emerald-500' : 'bg-primary-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((wordCount / 200) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>

          {/* AI Analysis Info */}
          <div className="mt-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-primary-300 font-medium">AI-Powered Analysis</p>
                <p className="text-dark-400 text-sm mt-1">
                  Once you submit, our AI will automatically extract skills, tech stack, and requirements 
                  from your job description to help match with the best candidates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="btn-secondary"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-4">
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-primary-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">AI analyzing description...</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
