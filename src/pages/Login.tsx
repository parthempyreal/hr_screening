import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Users,
  BarChart3,
  UserPlus
} from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const { login, register } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isRegisterMode && !name)) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isRegisterMode) {
        await register(email, password, name, company);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
  };

  const features = [
    { icon: Zap, title: 'AI-Powered Screening', desc: 'Automatically extract skills from resumes' },
    { icon: Users, title: 'Smart Matching', desc: 'Match candidates to jobs instantly' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track hiring metrics in real-time' },
  ];

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-12"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center glow-teal">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl gradient-text">TalentAI</h1>
              <p className="text-dark-400">Smart Hiring Platform</p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="font-display text-5xl font-bold text-dark-50 leading-tight mb-4">
              Hire Smarter,<br />
              <span className="gradient-text">Not Harder</span>
            </h2>
            <p className="text-dark-300 text-lg max-w-md">
              AI-powered applicant tracking that helps you find the best candidates faster than ever before.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-dark-800/50 border border-dark-700/50 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-100">{feature.title}</h3>
                  <p className="text-dark-400 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 flex gap-12"
          >
            <div>
              <p className="font-display text-4xl font-bold gradient-text">10K+</p>
              <p className="text-dark-400 text-sm">Companies Trust Us</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold gradient-text">95%</p>
              <p className="text-dark-400 text-sm">Faster Hiring</p>
            </div>
            <div>
              <p className="font-display text-4xl font-bold gradient-text">50M</p>
              <p className="text-dark-400 text-sm">Candidates Screened</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl gradient-text">TalentAI</h1>
              <p className="text-dark-400 text-sm">Smart Hiring Platform</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="glass rounded-3xl p-8 animated-border">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-dark-50 mb-2">
                {isRegisterMode ? 'Create account' : 'Welcome back'}
              </h2>
              <p className="text-dark-400">
                {isRegisterMode 
                  ? 'Get started with your recruiter account' 
                  : 'Sign in to your recruiter dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                {isRegisterMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Full Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="input-field w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Enter your company name"
                        className="input-field w-full"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRegisterMode ? 'Create a password (min 6 chars)' : 'Enter your password'}
                    className="input-field w-full"
                  />
                </div>
              </div>

              {!isRegisterMode && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded bg-dark-700 border-dark-600 text-primary-500 focus:ring-primary-500/20" />
                    <span className="text-dark-300">Remember me</span>
                  </label>
                  <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isRegisterMode ? 'Create Account' : 'Sign In'}
                    {isRegisterMode ? <UserPlus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                  </>
                )}
              </button>
            </form>

            {/* Info box */}
            <div className="mt-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-primary-300 font-medium">
                    {isRegisterMode ? 'Free to start' : 'Connected to API'}
                  </p>
                  <p className="text-dark-400">
                    {isRegisterMode 
                      ? 'No credit card required. Start hiring today!'
                      : 'Your data is securely stored and synced'}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle mode link */}
            <p className="mt-8 text-center text-dark-400 text-sm">
              {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button"
                onClick={toggleMode}
                className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                {isRegisterMode ? 'Sign in' : 'Get started free'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
