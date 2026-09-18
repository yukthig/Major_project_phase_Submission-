import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Upload, Settings, Brain, Box, 
  TrendingUp, BarChart3, FileText, Shield, LogOut, Sun, Moon, Menu, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Upload, label: 'MRI Upload', path: '/upload' },
  { icon: Settings, label: 'Preprocessing', path: '/preprocessing' },
  { icon: Brain, label: 'Segmentation', path: '/segmentation' },
  { icon: Box, label: '3D Reconstruction', path: '/reconstruction' },
  { icon: TrendingUp, label: 'Progression Analysis', path: '/progression' },
  { icon: BarChart3, label: 'Results', path: '/results' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Shield, label: 'Admin Panel', path: '/admin', adminOnly: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, darkMode, toggleSidebar, toggleDarkMode } = useUIStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  const filteredNavItems = user?.role === 'admin' 
    ? navItems 
    : navItems.filter(item => !item.adminOnly);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 glass rounded-lg lg:hidden"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-[280px] glass-lg z-40"
          >
            <div className="flex flex-col h-full p-6">
              {/* Logo */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold gradient-text">NeuroVision</h1>
                <p className="text-sm text-dark-500 dark:text-dark-400">AI Platform</p>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'gradient-primary text-white shadow-lg'
                          : 'text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="space-y-4 pt-4 border-t border-dark-200 dark:border-dark-700">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* User Info */}
                <div className="px-4 py-3 glass-sm rounded-lg">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-dark-500 dark:text-dark-400 truncate">{user?.email}</p>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-lg p-6 rounded-xl max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Are you sure you want to logout? You will need to login again to access the platform.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
