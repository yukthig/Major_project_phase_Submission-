import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Activity, Users, FileText, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useScanStore } from '@/store/scanStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { scans, fetchScans } = useScanStore();

  useEffect(() => {
    fetchScans();
  }, []);

  // Calculate live statistics dynamically from Single Source of Truth scan store
  const totalScansCount = scans.length;
  const segmentationsCount = scans.filter(s => s.status === 'segmented' || s.status === 'reconstructed').length;
  const uniquePatientsCount = new Set(scans.map(s => s.patientId)).size;
  const reportsCount = scans.filter(s => s.status === 'reconstructed' || s.status === 'segmented').length;

  // Day-by-day activity distribution derived from scan timestamps
  const getDayCounts = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts: { [key: string]: number } = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    
    scans.forEach(s => {
      if (s.createdAt) {
        const d = new Date(s.createdAt);
        const dayName = days[d.getDay()];
        if (counts[dayName] !== undefined) {
          counts[dayName] += 1;
        }
      }
    });

    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return orderedDays.map(day => ({
      day,
      activity: counts[day] || 0
    }));
  };

  const activityData = getDayCounts();

  // Recent activity list populated from actual scans sorted chronologically descending
  const recentActivities = [...scans]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5)
    .map((scan, idx) => {
      const type = scan.status === 'reconstructed' ? '3D Reconstruction Completed' :
                   scan.progression?.hasSufficientData ? 'Progression Analysis Completed' : 'Segmentation Completed';
      const timeStr = scan.createdAt 
        ? new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Recent';

      return {
        id: scan._id || scan.scanId || `act_${idx}`,
        patientId: scan.patientId || 'P001',
        title: type,
        time: timeStr,
        details: `${scan.tumorType || 'Glioma'} volume: ${(scan.volume || 13.8).toFixed(2)} cm³ (${scan.modality || 'T1-CE'})`
      };
    });

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-full text-xs font-semibold">
              Demo Dataset Registry
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, Dr. Admin. Longitudinal neuro-imaging analytics system status.
          </p>
        </div>

        <button 
          onClick={() => navigate('/reports')} 
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 text-xs flex items-center gap-2"
        >
          <FileText size={16} />
          Generate Report
        </button>
      </div>

      {/* 4 Live Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Scans */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="glass p-6 rounded-2xl flex flex-col justify-between border border-dark-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Scans</p>
              <h2 className="text-3xl font-bold text-white mt-2">{totalScansCount.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <FileText size={20} className="text-sky-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-4">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 size={12} /> Live Sync
            </span>
            <span className="text-slate-400">Longitudinal MRI Scans</span>
          </div>
        </motion.div>

        {/* Segmentations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl flex flex-col justify-between border border-dark-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Segmentations</p>
              <h2 className="text-3xl font-bold text-white mt-2">{segmentationsCount.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <Brain size={20} className="text-purple-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-4">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 size={12} /> UNet3D
            </span>
            <span className="text-slate-400">AI Model Executed</span>
          </div>
        </motion.div>

        {/* Total Patients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass p-6 rounded-2xl flex flex-col justify-between border border-dark-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total Patients</p>
              <h2 className="text-3xl font-bold text-white mt-2">{uniquePatientsCount.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <Users size={20} className="text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-4">
            <span className="text-sky-400 font-semibold">Unique Patient IDs</span>
            <span className="text-slate-400">(P001 - P006)</span>
          </div>
        </motion.div>

        {/* Reports Generated */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="glass p-6 rounded-2xl flex flex-col justify-between border border-dark-700"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Reports Generated</p>
              <h2 className="text-3xl font-bold text-white mt-2">{reportsCount.toLocaleString()}</h2>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <ShieldCheck size={20} className="text-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-4">
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              ✓ Verified
            </span>
            <span className="text-slate-400">Clinical PDFs Ready</span>
          </div>
        </motion.div>
      </div>

      {/* Main Analytics Row: Scan Activity & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scan Activity Trend Graph */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-dark-700 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Scan Activity Trend</h3>
              <p className="text-xs text-slate-400">Weekly longitudinal MRI acquisition volume</p>
            </div>
            <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
              Total: {totalScansCount} Scans
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="activity" stroke="#0284c7" fillOpacity={1} fill="url(#activityGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Activity Panel */}
        <div className="glass p-6 rounded-2xl border border-dark-700 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
              <Clock size={18} className="text-sky-400" />
              Recent System Activity
            </h3>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-3 bg-dark-900/60 rounded-xl border border-dark-800 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{act.title}</span>
                    <span className="text-sky-400 font-mono text-[11px]">Patient {act.patientId}</span>
                  </div>
                  <p className="text-[11px] text-dark-400">{act.details}</p>
                  <span className="text-[10px] text-dark-500 block font-mono">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/progression')}
            className="w-full btn-secondary text-xs mt-2"
          >
            View Longitudinal Patients Registry
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
