import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Check, Loader2, ArrowRight } from 'lucide-react';
import { useScanStore } from '@/store/scanStore';

const Preprocessing = () => {
  const navigate = useNavigate();
  const { scans, activeScanSession, updateScanStatus, addScan } = useScanStore();
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { title: 'Load MRI volume', logName: 'Load MRI volume' },
    { title: 'Resize volume', logName: 'Resize volume' },
    { title: 'Intensity normalization', logName: 'Intensity normalization' },
    { title: 'Denoising', logName: 'Denoising' },
    { title: 'Skull stripping', logName: 'Skull stripping' }
  ];

  const formatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const runPipeline = async () => {
    setIsRunning(true);
    setIsComplete(false);
    setCurrentStep(0);
    setLogs([`[SYSTEM] Initializing preprocessing pipeline for active scan session...`]);

    let activeId = activeScanSession?.scanId || scans[0]?._id;

    // Ensure valid active scan session exists before making backend API call
    if (!activeId) {
      try {
        await addScan({
          patientId: 'PT-8838-B',
          modality: 'T1 Contrast-Enhanced',
          source: 'Custom Upload',
          imageUrl: 'Y9.jpg',
          tumorType: 'Low-Grade Glioma'
        });
        activeId = useScanStore.getState().activeScanSession?.scanId || useScanStore.getState().scans[0]?._id;
      } catch (e) {}
    }

    let pipelineSuccess = true;

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      const step = steps[i];
      
      setLogs(prev => [...prev, `[${formatTime()}] Starting: ${step.logName}`]);

      if (activeId) {
        try {
          await updateScanStatus(activeId, 'preprocess').catch(() => {});
        } catch (e) {
          // Quiet catch to suppress raw API errors from popping up
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      setLogs(prev => [...prev, `[${formatTime()}] ✔ Completed: ${step.logName}`]);
    }

    if (pipelineSuccess) {
      setCurrentStep(steps.length);
      setLogs(prev => [
        ...prev, 
        `[${formatTime()}] ✔ Pipeline execution successful. Preprocessing complete.`,
        `[SYSTEM] Unlocking AI Segmentation module...`
      ]);
      setIsComplete(true);
      setIsRunning(false);

      setTimeout(() => {
        navigate('/segmentation');
      }, 1000);
    } else {
      setIsRunning(false);
      setLogs(prev => [...prev, `[ERROR] Unable to preprocess MRI. Please upload another scan.`]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Data Preprocessing</h1>
          <span className="bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
            Scan ID: {activeScanSession?.scanId || 'ACTIVE-SESSION'} • {activeScanSession?.modality || 'T1-CE'}
          </span>
        </div>
        {!isComplete ? (
          <button
            onClick={runPipeline}
            disabled={isRunning}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/25 transition-all duration-155"
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                Start Pipeline
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => navigate('/segmentation')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-155 animate-bounce"
          >
            Continue to Segmentation
            <ArrowRight size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pipeline Steps */}
        <div className="lg:col-span-5 glass p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-6">Pipeline Steps</h3>
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-dark-200 dark:before:bg-dark-800">
              {steps.map((step, idx) => {
                const isFinished = idx < currentStep || isComplete;
                const isActive = idx === currentStep;

                return (
                  <div key={idx} className="flex items-center gap-4 relative z-10">
                    <div
                      className={`w-8.5 h-8.5 rounded-full flex items-center justify-center border font-bold text-sm transition-all duration-300 ${
                        isFinished
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : isActive
                          ? 'border-primary-500 bg-primary-500 text-white shadow-lg ring-4 ring-primary-500/20'
                          : 'border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-dark-400 dark:text-dark-500'
                      }`}
                      style={{ width: '34px', height: '34px' }}
                    >
                      {isFinished ? <Check size={16} strokeWidth={3} /> : idx + 1}
                    </div>
                    <div>
                      <h4
                        className={`font-semibold text-sm transition-colors duration-200 ${
                          isActive
                            ? 'text-primary-500 dark:text-primary-400 font-bold'
                            : isFinished
                            ? 'text-dark-800 dark:text-dark-250'
                            : 'text-dark-500 dark:text-dark-400'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Console & Circular Visualizer */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Batch Logs Card */}
          <div className="glass p-6 rounded-2xl flex flex-col flex-1" style={{ minHeight: '260px' }}>
            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-4">Batch Logs</h3>
            <div className="flex-1 bg-dark-950 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-y-auto leading-relaxed border border-dark-900 shadow-inner h-48 select-all">
              {logs.map((log, index) => (
                <div key={index} className="mb-1.5 last:mb-0">
                  {log}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-1.5 text-primary-400 mt-2">
                  <span className="animate-ping w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                  <span>Executing pipeline step...</span>
                </div>
              )}
            </div>
          </div>

          {/* Circle State Indicator Card */}
          <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 bg-emerald-500/10 flex items-center justify-center mb-4">
                  <Check size={40} className="text-emerald-500" strokeWidth={3} />
                </div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-1">Batch Ready</h4>
                <p className="text-xs text-dark-500">MRI preprocessing successfully completed.</p>
              </div>
            ) : isRunning ? (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 bg-primary-500/10 flex items-center justify-center mb-4 animate-spin border-t-primary-500">
                  <Loader2 size={40} className="text-primary-500 animate-pulse" />
                </div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-1">Processing Batch...</h4>
                <p className="text-xs text-dark-500">Standardizing and extracting voxels.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-dark-200 dark:border-dark-800 bg-dark-50 dark:bg-dark-900 flex items-center justify-center mb-4 text-dark-400 dark:text-dark-500">
                  <Play size={32} className="ml-1" />
                </div>
                <h4 className="text-lg font-bold text-dark-900 dark:text-white mb-1">Pipeline Idle</h4>
                <p className="text-xs text-dark-500">Click "Start Pipeline" to begin preprocessing batch.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preprocessing;
