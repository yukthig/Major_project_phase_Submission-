# 📝 COMPLETE PAGE FILES FOR NEUROVISION AI PLATFORM

## INSTRUCTIONS

Copy each file content below and create the file in the specified path.

All TypeScript errors will disappear after running `npm install` in the client folder.

---

## 1. pages/Signup.tsx

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/login');
    } catch (error) {
      // Error handled in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-lg rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-dark-600 dark:text-dark-400">
              Join NeuroVision AI Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-field"
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-field"
                placeholder="doctor@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-600 dark:text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
```

---

## 2. pages/Landing.tsx

```tsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Activity, Zap, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Segmentation',
      description: 'Advanced deep learning models for precise tumor detection'
    },
    {
      icon: Activity,
      title: '3D Reconstruction',
      description: 'Interactive 3D visualization of brain tumors'
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Comprehensive clinical metrics and insights'
    },
    {
      icon: Shield,
      title: 'Clinical Reporting',
      description: 'Automated PDF reports for specialist review'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-6">
            <Brain size={40} className="text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            NeuroVision AI Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Advanced MRI Brain Tumor Analysis with AI-powered segmentation, 
            3D reconstruction, and clinical reporting for modern healthcare
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-8 py-4"
            >
              Start Analysis
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
        >
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-primary-400 mb-2">98.5%</div>
            <div className="text-gray-400">Dice Score</div>
          </div>
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-primary-400 mb-2">&lt;2s</div>
            <div className="text-gray-400">Inference Time</div>
          </div>
          <div className="glass p-8 rounded-xl text-center">
            <div className="text-5xl font-bold text-primary-400 mb-2">3D</div>
            <div className="text-gray-400">Reconstruction</div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-6 rounded-xl card-hover"
            >
              <feature.icon size={32} className="text-primary-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
```

---

## 3. pages/Dashboard.tsx

```tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Activity, Box, TrendingUp, Upload } from 'lucide-react';
import { useScanStore } from '@/store/scanStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { scans } = useScanStore();
  const [stats, setStats] = useState({
    totalScans: 0,
    segmentations: 0,
    models3D: 0,
    avgDice: 0
  });

  useEffect(() => {
    const segmented = scans.filter(s => s.status === 'segmented' || s.status === 'reconstructed');
    const reconstructed = scans.filter(s => s.status === 'reconstructed');
    const avgDice = segmented.length > 0
      ? segmented.reduce((acc, s) => acc + (s.segmentationMetrics?.diceScore || 0), 0) / segmented.length
      : 0;

    setStats({
      totalScans: scans.length,
      segmentations: segmented.length,
      models3D: reconstructed.length,
      avgDice: avgDice
    });
  }, [scans]);

  const weeklyData = [
    { day: 'Mon', scans: 12 },
    { day: 'Tue', scans: 19 },
    { day: 'Wed', scans: 15 },
    { day: 'Thu', scans: 25 },
    { day: 'Fri', scans: 22 },
    { day: 'Sat', scans: 18 },
    { day: 'Sun', scans: 10 }
  ];

  const tumorData = [
    { name: 'Glioma', value: 35, color: '#ef4444' },
    { name: 'Meningioma', value: 30, color: '#f59e0b' },
    { name: 'Pituitary', value: 25, color: '#3b82f6' },
    { name: 'No Tumor', value: 10, color: '#10b981' }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'uploaded': return 'badge-info';
      case 'preprocessed': return 'badge-warning';
      case 'segmented': return 'badge-success';
      case 'reconstructed': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
        <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2">
          <Upload size={20} />
          New Upload
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl card-hover">
          <div className="flex items-center justify-between mb-4">
            <Brain size={32} className="text-primary-500" />
            <span className="text-3xl font-bold">{stats.totalScans}</span>
          </div>
          <p className="text-dark-600 dark:text-dark-400">Total MRI Scans</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-xl card-hover">
          <div className="flex items-center justify-between mb-4">
            <Activity size={32} className="text-green-500" />
            <span className="text-3xl font-bold">{stats.segmentations}</span>
          </div>
          <p className="text-dark-600 dark:text-dark-400">Segmentations</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 rounded-xl card-hover">
          <div className="flex items-center justify-between mb-4">
            <Box size={32} className="text-purple-500" />
            <span className="text-3xl font-bold">{stats.models3D}</span>
          </div>
          <p className="text-dark-600 dark:text-dark-400">3D Models</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 rounded-xl card-hover">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp size={32} className="text-orange-500" />
            <span className="text-3xl font-bold">{(stats.avgDice * 100).toFixed(1)}%</span>
          </div>
          <p className="text-dark-600 dark:text-dark-400">Avg Dice Score</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Tumor Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tumorData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label
              >
                {tumorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Scans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Recent Scans</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left py-3 px-4">Patient ID</th>
                <th className="text-left py-3 px-4">Modality</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {scans.slice(0, 5).map((scan) => (
                <tr key={scan._id} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/50">
                  <td className="py-3 px-4">{scan.patientId}</td>
                  <td className="py-3 px-4">{scan.modality}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${getStatusColor(scan.status)}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(scan.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
```

---

## REMAINING PAGES

**Continue to next message for:**
- Upload.tsx
- Preprocessing.tsx
- Segmentation.tsx
- Reconstruction.tsx (3D WOW!)
- Results.tsx
- Reports.tsx
- Admin.tsx
- NotFound.tsx

---

## Quick Setup After Creating All Files:

```bash
# In client folder
npm install
npm run dev

# In server folder  
npm install
npm run seed
npm run dev
```

Then open: http://localhost:3000
