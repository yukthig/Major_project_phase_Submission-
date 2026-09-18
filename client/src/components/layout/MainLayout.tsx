import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useScanStore } from '@/store/scanStore';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { fetchScans } = useScanStore();

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100 dark:from-dark-900 dark:to-dark-800">
      <Sidebar />
      
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:ml-[280px] p-6 lg:p-8"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default MainLayout;
