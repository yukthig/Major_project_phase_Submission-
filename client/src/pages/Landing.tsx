import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Activity, Zap, Shield, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Segmentation',
      description: 'Advanced deep learning models (U-Net, Attention U-Net) for precise tumor detection with 98.5% Dice score'
    },
    {
      icon: Activity,
      title: '3D Reconstruction',
      description: 'Interactive 3D visualization of brain tumors with real-time rotation, zoom, and analysis'
    },
    {
      icon: Zap,
      title: 'Real-Time Analytics',
      description: 'Comprehensive clinical metrics including volume, surface area, and risk assessment'
    },
    {
      icon: Shield,
      title: 'Clinical Reporting',
      description: 'Automated PDF report generation with complete scan analysis and recommendations'
    }
  ];

  const stats = [
    { value: '98.5%', label: 'Dice Score' },
    { value: '<2s', label: 'Inference Time' },
    { value: '3D', label: 'Reconstruction' },
    { value: '4+', label: 'AI Models' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Hero Section */}
      <div className="relative container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 mb-8 shadow-2xl"
          >
            <Brain size={48} className="text-white" />
          </motion.div>
          
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
            NeuroVision AI
          </h1>
          
          <p className="text-2xl text-gray-300 mb-4 max-w-4xl mx-auto">
            Advanced MRI Brain Tumor Analysis Platform
          </p>
          
          <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">
            Powered by deep learning for automated tumor segmentation, 3D reconstruction, 
            and clinical reporting. Built for modern healthcare.
          </p>
          
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary text-lg px-10 py-4 flex items-center gap-2"
            >
              Start Analysis
              <ArrowRight size={20} />
            </button>
            <button className="btn-secondary text-lg px-10 py-4">
              View Demo
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="glass p-8 rounded-xl text-center card-hover"
            >
              <div className="text-5xl font-bold text-primary-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features */}
        <div className="mb-20">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-12"
          >
            Key Features
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="glass p-6 rounded-xl card-hover"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="glass p-12 rounded-2xl mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-400 mb-2">React</div>
              <div className="text-sm text-gray-400">Frontend</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-400 mb-2">Node.js</div>
              <div className="text-sm text-gray-400">Backend</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-400 mb-2">MongoDB</div>
              <div className="text-sm text-gray-400">Database</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-primary-400 mb-2">Three.js</div>
              <div className="text-sm text-gray-400">3D Visualization</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Login to access the full platform and analyze MRI scans
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary text-lg px-12 py-4"
          >
            Login to NeuroVision
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
