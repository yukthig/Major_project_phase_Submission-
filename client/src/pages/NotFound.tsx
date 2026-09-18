import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-400/20 dark:bg-primary-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
      
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] dark:opacity-20 opacity-40 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10 text-center"
      >
        <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl rounded-3xl p-10 sm:p-14 shadow-2xl border border-white/20 dark:border-white/5 relative overflow-hidden">
          {/* Large 404 Watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-black text-slate-100 dark:text-dark-800/50 pointer-events-none select-none z-0">
            404
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 mb-8 shadow-lg shadow-rose-500/30 flex items-center justify-center"
            >
              <Brain size={48} className="text-white" strokeWidth={1.5} />
            </motion.div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
              Page Not Found
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700/50 text-slate-700 dark:text-slate-200 font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <ArrowLeft size={20} /> Go Back
              </button>
              
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-500 hover:to-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all active:scale-95"
              >
                <Home size={20} /> Dashboard
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
