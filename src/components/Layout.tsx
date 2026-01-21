import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  LogOut, 
  Sparkles,
  Bell,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../store/useStore';

const sidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/jobs', icon: Briefcase, label: 'Job Posts' },
  { to: '/applications', icon: Users, label: 'Applications' },
];

export default function Layout() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen glass border-r border-dark-700/50 flex flex-col z-50
          w-72 transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl gradient-text">TalentAI</h1>
                <p className="text-xs text-dark-400">Smart Hiring Platform</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 text-dark-400 hover:text-dark-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-dark-100 truncate">{user?.name || 'Recruiter'}</p>
              <p className="text-xs text-dark-400 truncate">{user?.company}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-dark-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass border-b border-dark-700/50">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-dark-400 hover:text-dark-100 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">TalentAI</span>
            </div>

            {/* Search - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search jobs, candidates..."
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              <button className="relative p-2 lg:p-3 text-dark-400 hover:text-dark-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 lg:top-2 right-1 lg:right-2 w-2 h-2 bg-accent-500 rounded-full"></span>
              </button>
              <div className="hidden lg:block h-8 w-px bg-dark-700"></div>
              <button
                onClick={() => navigate('/jobs/create')}
                className="btn-primary flex items-center gap-2 text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Post New Job</span>
                <span className="sm:hidden">Post</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
