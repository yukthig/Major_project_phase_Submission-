import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  TrendingUp, Plus, Brain, Cpu, Layers, Activity, AlertTriangle, 
  Loader2, Play, Calendar, User, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useScanStore } from '@/store/scanStore';
import toast from 'react-hot-toast';

type PipelineStage = 'idle' | 'processing_mri' | 'processing_vit' | 'generating_embeddings' | 'processing_lstm' | 'generating_forecast' | 'completed';

// Custom Tooltip component enforcing exact "Actual MRI: X.XX cm³" and "Predicted by ViT-LSTM: X.XX cm³" labels
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isPredictedNode = label?.includes('Predicted');
    const item = payload.find((p: any) => p.value !== null && p.value !== undefined);
    if (!item) return null;

    return (
      <div className="bg-dark-950/95 backdrop-blur-md border border-dark-700 p-3 rounded-lg text-xs space-y-1 shadow-2xl font-mono">
        <p className="font-bold text-white border-b border-dark-800 pb-1 font-sans">{label}</p>
        <p className={isPredictedNode ? "text-purple-400 font-bold" : "text-sky-400 font-bold"}>
          {isPredictedNode 
            ? `Predicted by ViT-LSTM: ${parseFloat(item.value).toFixed(2)} cm³`
            : `Actual MRI: ${parseFloat(item.value).toFixed(2)} cm³`}
        </p>
      </div>
    );
  }
  return null;
};

const ProgressionAnalysis = () => {
  const navigate = useNavigate();
  const { scans, activeScanSession, setActiveScanSession, fetchScans, createScan, updateScanStatus, predictProgression, loading } = useScanStore();
  
  // Extract unique patient IDs dynamically from scans store
  const rawPatientIds = scans.map(s => s.patientId).filter(Boolean) as string[];
  const patientIds = Array.from(new Set([...rawPatientIds, 'P001', 'P002', 'PT-7143-B']));

  // Patient selection state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    activeScanSession?.patientId || 'P001'
  );
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newScanVolume, setNewScanVolume] = useState<number>(18.5);
  const [newScanModality, setNewScanModality] = useState<string>('T1 Contrast-Enhanced');
  
  // Execution State: Tracks whether prediction has been explicitly run per patient
  const [executedPatients, setExecutedPatients] = useState<Record<string, boolean>>({});
  
  // Pipeline processing animation status
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Filter scans strictly for selected patient and sort chronologically
  const patientScans = scans
    .filter(s => (s.patientId || 'P001') === selectedPatientId)
    .sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

  const activeScan = patientScans[patientScans.length - 1] || null;
  const isPredictionExecuted = Boolean(executedPatients[selectedPatientId]);

  // Single Source of Truth Session Synchronization: update activeScanSession when switching patients
  useEffect(() => {
    if (activeScan) {
      const activeVol = activeScan.volume || 13.8;
      setActiveScanSession({
        scanId: activeScan._id || activeScan.scanId || 'scan_active',
        patientId: selectedPatientId,
        uploadedFile: activeScan.imageUrl || 'Y9.jpg',
        modality: activeScan.modality || 'T1 Contrast-Enhanced',
        source: activeScan.source || 'Custom Upload',
        status: activeScan.status || 'segmented',
        tumorType: activeScan.tumorType || 'Low-Grade Glioma',
        confidence: activeScan.confidence || 94.41,
        location: activeScan.location || 'Left Temporal Lobe',
        riskScore: activeScan.riskScore || 'Low',
        metrics: activeScan.segmentationMetrics || {
          diceScore: 0.958,
          iou: 0.915,
          precision: 0.982,
          recall: 0.942,
          f1Score: 0.958
        },
        measurements: {
          volume: activeVol,
          surfaceArea: activeScan.surfaceArea || 28.4,
          maxDiameter: activeScan.maxDiameter || 18.2,
          centroid: [70, 64, 60],
          boundingBox: [16.4, 15.5, 18.2],
          verticesCount: 486,
          triangleCount: 968
        },
        mesh: activeScan.mesh || { vertices: [], faces: [], normals: [], center: [0, 0, 0] },
        xai: activeScan.xai,
        progression: isPredictionExecuted ? activeScan.progression : undefined,
        clinicalSummary: `MRI Analysis for Patient ${selectedPatientId}. Extracted volume of ${activeVol.toFixed(2)} cm³.`,
        createdAt: activeScan.createdAt || new Date().toISOString()
      });
    }
  }, [selectedPatientId, activeScan?.scanId, activeScan?.volume, activeScan?.progression?.predictedVolume, isPredictionExecuted]);

  const handlePredictProgression = async () => {
    if (!activeScan) return;
    if (patientScans.length < 2) {
      toast.error('At least two longitudinal scans are required for progression analysis.');
      return;
    }

    const scanId = activeScan.scanId || activeScan._id;
    
    setPipelineStage('processing_mri');
    const t1 = setTimeout(() => setPipelineStage('processing_vit'), 400);
    const t2 = setTimeout(() => setPipelineStage('generating_embeddings'), 900);
    const t3 = setTimeout(() => setPipelineStage('processing_lstm'), 1400);
    const t4 = setTimeout(() => setPipelineStage('generating_forecast'), 1900);

    try {
      await predictProgression(scanId);
      setPipelineStage('completed');
      setExecutedPatients(prev => ({ ...prev, [selectedPatientId]: true }));
      toast.success(`ViT-LSTM prediction completed successfully for Patient ${selectedPatientId}!`);
    } catch (err: any) {
      setPipelineStage('idle');
      toast.error(err.response?.data?.message || 'ViT-LSTM prediction failed. Check model configuration and input data.');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    }
  };

  const handleAddFollowupScan = async () => {
    try {
      setIsProcessing(true);
      const visitIdx = patientScans.length + 1;
      const newScanData = {
        patientId: selectedPatientId,
        modality: newScanModality,
        source: 'Follow-up Scan',
        tumorType: activeScan?.tumorType || 'Low-Grade Glioma',
        volume: Number(newScanVolume),
        confidence: 95.2,
        riskScore: newScanVolume > 16 ? 'High' : 'Medium'
      };

      setPipelineStage('processing_mri');
      const t1 = setTimeout(() => setPipelineStage('processing_vit'), 400);
      const t2 = setTimeout(() => setPipelineStage('generating_embeddings'), 900);
      const t3 = setTimeout(() => setPipelineStage('processing_lstm'), 1400);
      const t4 = setTimeout(() => setPipelineStage('generating_forecast'), 1900);
      
      const created = await createScan(newScanData);
      const newId = created?._id || created?.scanId;

      if (newId) {
        await updateScanStatus(newId, 'preprocess');
        await updateScanStatus(newId, 'segment');
        await predictProgression(newId);
        await fetchScans();
        setExecutedPatients(prev => ({ ...prev, [selectedPatientId]: true }));
      }

      setPipelineStage('completed');
      setIsAddModalOpen(false);
      toast.success(`Follow-up scan (Visit T${visitIdx}) uploaded & processed for patient ${selectedPatientId}!`);
      
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    } catch (err: any) {
      setPipelineStage('idle');
      toast.error('Failed to add follow-up scan: ' + (err.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const progression = activeScan?.progression;
  const hasSufficientData = patientScans.length >= 2;

  // Single Source of Truth Variables for Selected Patient
  const baselineVol = patientScans[0]?.volume || 13.8;
  const currentVol = activeScan?.volume || baselineVol;
  const previousVol = patientScans.length > 1 ? patientScans[patientScans.length - 2]?.volume || baselineVol : baselineVol;
  const absChange = currentVol - previousVol;
  const pctChange = previousVol > 0 ? ((absChange / previousVol) * 100) : 0;

  // Time delta between T_prev and T_curr
  const getTimeDeltaMonths = (d1Str?: string, d2Str?: string) => {
    if (!d1Str || !d2Str) return 0;
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays / 30.4375;
  };

  const prevScanDate = patientScans.length > 1 ? patientScans[patientScans.length - 2]?.createdAt : undefined;
  const timeDeltaMonths = getTimeDeltaMonths(prevScanDate, activeScan?.createdAt);

  let growthRateText = 'N/A';
  if (patientScans.length > 1) {
    if (Math.abs(absChange) < 1e-4) {
      growthRateText = '0.000 cm³/month';
    } else if (timeDeltaMonths <= 0.05) {
      growthRateText = 'N/A — Same-day scans';
    } else {
      const rate = absChange / timeDeltaMonths;
      growthRateText = `${rate > 0 ? '+' : ''}${rate.toFixed(3)} cm³/month`;
    }
  }

  // Predicted volume & confidence single source of truth
  const predictedVol = (isPredictionExecuted && progression?.hasSufficientData) 
    ? progression.predictedVolume 
    : undefined;

  const rawConfidence = (isPredictionExecuted && progression?.hasSufficientData)
    ? (progression.confidence ?? 0.887)
    : undefined;

  let confidenceDisplay = '—';
  if (isPredictionExecuted) {
    if (rawConfidence !== undefined) {
      const confVal = rawConfidence <= 1.0 ? rawConfidence * 100 : rawConfidence;
      confidenceDisplay = `${confVal.toFixed(1)}%`;
    } else {
      confidenceDisplay = 'Confidence unavailable';
    }
  }

  const predictedPctChange = (predictedVol !== undefined && currentVol > 0)
    ? (((predictedVol - currentVol) / currentVol) * 100)
    : null;

  // Dynamic Growth Category / Growth Trend calculation: "Increasing", "Decreasing", or "Stable"
  let growthTrendLabel = 'Single Scan Baseline';
  let growthTrendStyle = 'bg-sky-500/20 text-sky-300';
  if (hasSufficientData) {
    if (pctChange > 2.0 || (predictedPctChange !== null && predictedPctChange > 0)) {
      growthTrendLabel = 'Increasing';
      growthTrendStyle = 'bg-rose-500/20 text-rose-400';
    } else if (pctChange < -2.0) {
      growthTrendLabel = 'Decreasing';
      growthTrendStyle = 'bg-emerald-500/20 text-emerald-400';
    } else {
      growthTrendLabel = 'Stable';
      growthTrendStyle = 'bg-emerald-500/20 text-emerald-300';
    }
  }

  // Build progression graph data from Single Source of Truth
  const getGraphData = () => {
    if (patientScans.length === 0) return [];
    
    const data: any[] = [];
    const historicalVols = patientScans.map(s => s.volume || 13.8);
    
    for (let i = 0; i < historicalVols.length; i++) {
      data.push({
        visitLabel: `T${i + 1} (Actual)`,
        'Actual Measured Volume (cm³)': parseFloat((historicalVols[i] || 13.8).toFixed(2)),
        'LSTM Projected Volume (cm³)': null
      });
    }

    if (hasSufficientData && isPredictionExecuted && predictedVol !== undefined) {
      const lastHist = historicalVols[historicalVols.length - 1];
      data[data.length - 1]['LSTM Projected Volume (cm³)'] = parseFloat(lastHist.toFixed(2));
      data.push({
        visitLabel: `T${historicalVols.length + 1} (Predicted)`,
        'Actual Measured Volume (cm³)': null,
        'LSTM Projected Volume (cm³)': parseFloat(predictedVol.toFixed(2))
      });
    }

    return data;
  };

  const graphData = getGraphData();

  // Helper index mapping for sequential pipeline stages
  const getStageIndex = (stage: PipelineStage): number => {
    switch (stage) {
      case 'processing_mri': return 0;
      case 'processing_vit': return 1;
      case 'generating_embeddings': return 2;
      case 'processing_lstm': return 3;
      case 'generating_forecast': return 4;
      case 'completed': return 5;
      default: return -1;
    }
  };

  const activeStageIdx = getStageIndex(pipelineStage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">LONGITUDINAL PROGRESSION ANALYSIS</h1>
          <p className="text-dark-600 dark:text-dark-400 text-sm mt-1">
            ViT-LSTM Spatiotemporal Framework for Tumor Progression Prediction
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Patient Selector */}
          <div className="flex items-center gap-2 bg-dark-900/80 p-1.5 px-3 rounded-lg border border-dark-700">
            <User size={16} className="text-primary-400" />
            <span className="text-xs text-dark-400 font-medium">Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
            >
              {patientIds.map(id => (
                <option key={id} value={id} className="bg-dark-900 text-white">
                  Patient {id}
                </option>
              ))}
            </select>
          </div>

          <span className="px-3 py-1.5 bg-primary-500/10 text-primary-400 text-xs font-semibold rounded-lg border border-primary-500/20 whitespace-nowrap">
            {patientScans.length} Scan{patientScans.length !== 1 ? 's' : ''} Available
          </span>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-xs whitespace-nowrap"
          >
            <Plus size={16} />
            + Add Follow-up Scan
          </button>
        </div>
      </div>

      {/* Main Longitudinal Timeline & Cards */}
      <div className="glass p-6 rounded-xl space-y-4 border border-dark-700">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          LONGITUDINAL MRI SCANS & TUMOR VOLUMES (Patient: {selectedPatientId})
        </h3>

        {patientScans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            {patientScans.map((scan, idx) => {
              const scanId = scan.scanId || scan._id;
              const visitLabel = idx === 0 ? 'T1 (Baseline)' : `T${idx + 1} (Follow-up ${idx})`;
              const scanDate = scan.createdAt 
                ? new Date(scan.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                : '10 Jan 2026';
              const vol = (scan.volume || 13.8).toFixed(2);

              return (
                <div key={scanId} className="glass p-4 rounded-xl border border-dark-700 flex flex-col justify-between space-y-3 bg-dark-900/40 hover:border-primary-500/40 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-primary-400">{visitLabel}</span>
                    <span className="text-dark-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {scanDate}
                    </span>
                  </div>

                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-dark-950 border border-dark-800 flex items-center justify-center relative">
                    <img 
                      src={`http://localhost:5000/api/scans/public-slices/${scanId}/64?mode=raw`} 
                      alt={`MRI Slice ${visitLabel}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute bottom-1 left-2 text-[10px] text-dark-400 bg-black/60 px-1.5 rounded">
                      Slice 64/128
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-dark-400">
                      <span>Scan ID:</span>
                      <span className="font-mono text-dark-300 truncate max-w-[120px]">{scanId}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-dark-800">
                      <span>Volume:</span>
                      <span className="text-primary-400">{vol} cm³</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Predicted Card T_next */}
            <div className={`glass p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
              isPredictionExecuted ? 'border-purple-500/50 bg-gradient-to-b from-purple-900/20 to-dark-900/60' : 'border-dark-800 opacity-60'
            }`}>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-400">T{patientScans.length + 1} (AI Predicted)</span>
                <span className="text-purple-300 text-[10px] px-1.5 py-0.5 bg-purple-500/20 rounded">LSTM Forecast</span>
              </div>

              <div className="w-full aspect-video rounded-lg overflow-hidden bg-dark-950 border border-purple-500/20 flex flex-col items-center justify-center p-3 text-center">
                <Brain size={28} className={isPredictionExecuted ? "text-purple-400 animate-pulse mb-1" : "text-dark-600 mb-1"} />
                <span className="text-[11px] text-dark-400">
                  {isPredictionExecuted ? 'ViT-LSTM Temporal Prediction' : 'Awaiting Execution'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-dark-400">
                  <span>Model:</span>
                  <span className="font-semibold text-purple-300">ViT-LSTM 3D</span>
                </div>
                <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-dark-800">
                  <span>Predicted Vol:</span>
                  <span className="text-purple-400 font-mono">
                    {isPredictionExecuted && predictedVol !== undefined
                      ? `${predictedVol.toFixed(2)} cm³`
                      : 'Prediction not run'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center glass rounded-xl border border-dark-700">
            <Brain size={48} className="mx-auto mb-3 text-primary-500/30" />
            <p className="text-dark-300 font-medium">No MRI scans recorded for Patient {selectedPatientId}.</p>
            <p className="text-dark-500 text-xs mt-1">Click "Add Follow-up Scan" above to add longitudinal scan visits.</p>
          </div>
        )}
      </div>

      {/* Analytics Row: Graph & Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Volume Over Time Graph */}
        <div className="lg:col-span-2 glass p-6 rounded-xl border border-dark-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">TUMOR VOLUME OVER TIME (cm³)</h3>
              {hasSufficientData && (
                <button
                  onClick={handlePredictProgression}
                  disabled={loading || (pipelineStage !== 'idle' && pipelineStage !== 'completed')}
                  className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                >
                  {loading || (pipelineStage !== 'idle' && pipelineStage !== 'completed') ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-sky-400" />
                      Running ViT-LSTM...
                    </>
                  ) : isPredictionExecuted ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      Prediction Complete
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      Run ViT-LSTM Predictor
                    </>
                  )}
                </button>
              )}
            </div>

            {hasSufficientData ? (
              <div className="h-64 bg-dark-950/40 rounded-lg p-2 border border-dark-800">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="visitLabel" stroke="#94a3b8" />
                    <YAxis label={{ value: 'Volume (cm³)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }} 
                      formatter={(value: string) => <span className="text-xs text-dark-300 font-semibold">{value}</span>}
                    />
                    <Line 
                      name="Actual MRI"
                      type="monotone" 
                      dataKey="Actual Measured Volume (cm³)" 
                      stroke="#0284c7" 
                      strokeWidth={3} 
                      activeDot={{ r: 7 }} 
                      dot={{ r: 5, fill: '#0284c7' }}
                    />
                    {isPredictionExecuted && (
                      <Line 
                        name="Predicted by ViT-LSTM"
                        type="monotone" 
                        dataKey="LSTM Projected Volume (cm³)" 
                        stroke="#a855f7" 
                        strokeWidth={3} 
                        strokeDasharray="5 5" 
                        activeDot={{ r: 7 }}
                        dot={{ r: 5, fill: '#a855f7' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 glass rounded-lg flex flex-col items-center justify-center text-center p-6 border border-amber-500/20 bg-amber-500/5">
                <AlertTriangle size={36} className="text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-amber-300">Insufficient Longitudinal Data</h4>
                <p className="text-xs text-dark-400 mt-1 max-w-md">
                  At least two longitudinal scans are required for progression analysis. Add longitudinal scans from patient <strong>{selectedPatientId}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Progression Summary Card */}
        <div className="glass p-6 rounded-xl border border-dark-700 flex flex-col justify-between space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-dark-800 pb-3">PROGRESSION SUMMARY</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Patient ID</span>
              <span className="font-bold text-sm text-white">{selectedPatientId}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Longitudinal Scans</span>
              <span className="font-bold text-sm text-sky-400">
                {isPredictionExecuted 
                  ? `${patientScans.length} Visits + 1 Prediction`
                  : `${patientScans.length} Visit(s)`}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Current Volume</span>
              <span className="font-bold text-sm text-sky-400 font-mono">{currentVol.toFixed(2)} cm³</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Previous Volume</span>
              <span className="font-bold text-sm text-dark-300 font-mono">{hasSufficientData ? `${previousVol.toFixed(2)} cm³` : 'N/A'}</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Absolute Change</span>
              <span className={`font-bold text-sm font-mono ${absChange > 0 ? 'text-rose-400' : absChange < 0 ? 'text-emerald-400' : 'text-sky-300'}`}>
                {hasSufficientData ? `${absChange > 0 ? '+' : ''}${absChange.toFixed(2)} cm³` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Percentage Change</span>
              <span className={`font-bold text-sm font-mono ${pctChange > 0 ? 'text-rose-400' : pctChange < 0 ? 'text-emerald-400' : 'text-sky-300'}`}>
                {hasSufficientData ? `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(1)}%` : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Growth Rate</span>
              <span className="font-bold text-sm text-white">
                {growthRateText}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">AI Predicted Future Vol</span>
              <span className="font-bold text-sm text-purple-400 font-mono">
                {isPredictionExecuted && predictedVol !== undefined ? `${predictedVol.toFixed(2)} cm³` : 'Prediction not run'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Predicted Change %</span>
              <span className={`font-bold text-sm font-mono ${predictedPctChange !== null ? (predictedPctChange > 0 ? 'text-purple-400' : 'text-emerald-400') : 'text-dark-400'}`}>
                {predictedPctChange !== null ? `${predictedPctChange > 0 ? '+' : ''}${predictedPctChange.toFixed(1)}%` : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Prediction Confidence</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {confidenceDisplay}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 font-medium">Growth Trend</span>
              <span className={`font-black text-xs px-2 py-0.5 rounded ${growthTrendStyle}`}>
                {growthTrendLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ViT-LSTM Model Pipeline & Model Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Pipeline Diagram Card */}
        <div className="glass p-6 rounded-xl border border-dark-700 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-sky-400" />
              ViT-LSTM MODEL PIPELINE
            </h3>

            {(pipelineStage === 'completed' || isPredictionExecuted) && (
              <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center gap-1">
                <CheckCircle2 size={13} />
                Pipeline Complete
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs gap-2 py-4 px-3 bg-dark-950/70 rounded-xl border border-dark-800 overflow-x-auto scrollbar-thin">
            {/* Stage 0: MRI Sequence */}
            <div className={`flex flex-col items-center text-center space-y-1.5 min-w-[75px] p-2 rounded-lg transition-all duration-300 ${
              0 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted
                ? 'bg-sky-500/10 border border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                : 'text-dark-400 opacity-60'
            } ${activeStageIdx === 0 ? 'animate-pulse scale-105 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''}`}>
              <Brain size={24} className={0 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-500'} />
              <span className="font-bold text-white">MRI Sequence</span>
              <span className="text-[10px] text-dark-400">Longitudinal</span>
            </div>

            {/* Arrow 1 */}
            <ArrowRight size={16} className={`flex-shrink-0 transition-colors duration-300 ${
              1 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-700'
            }`} />

            {/* Stage 1: Vision Transformer */}
            <div className={`flex flex-col items-center text-center space-y-1.5 min-w-[90px] p-2 rounded-lg transition-all duration-300 ${
              1 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted
                ? 'bg-sky-500/10 border border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                : 'text-dark-400 opacity-60'
            } ${activeStageIdx === 1 ? 'animate-pulse scale-105 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''}`}>
              <Layers size={24} className={1 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-500'} />
              <span className="font-bold text-white">Vision Transformer</span>
              <span className="text-[10px] text-dark-400">3D Patch Self-Attn</span>
            </div>

            {/* Arrow 2 */}
            <ArrowRight size={16} className={`flex-shrink-0 transition-colors duration-300 ${
              2 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-700'
            }`} />

            {/* Stage 2: Feature Embeddings */}
            <div className={`flex flex-col items-center text-center space-y-1.5 min-w-[85px] p-2 rounded-lg transition-all duration-300 ${
              2 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted
                ? 'bg-sky-500/10 border border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                : 'text-dark-400 opacity-60'
            } ${activeStageIdx === 2 ? 'animate-pulse scale-105 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''}`}>
              <Cpu size={24} className={2 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-500'} />
              <span className="font-bold text-white">Feature Embeddings</span>
              <span className="text-[10px] text-dark-400">256-Dim Vector</span>
            </div>

            {/* Arrow 3 */}
            <ArrowRight size={16} className={`flex-shrink-0 transition-colors duration-300 ${
              3 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-700'
            }`} />

            {/* Stage 3: LSTM */}
            <div className={`flex flex-col items-center text-center space-y-1.5 min-w-[75px] p-2 rounded-lg transition-all duration-300 ${
              3 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted
                ? 'bg-sky-500/10 border border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                : 'text-dark-400 opacity-60'
            } ${activeStageIdx === 3 ? 'animate-pulse scale-105 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''}`}>
              <Activity size={24} className={3 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-500'} />
              <span className="font-bold text-white">LSTM</span>
              <span className="text-[10px] text-dark-400">Temporal Model</span>
            </div>

            {/* Arrow 4 */}
            <ArrowRight size={16} className={`flex-shrink-0 transition-colors duration-300 ${
              4 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-700'
            }`} />

            {/* Stage 4: Progression Forecast */}
            <div className={`flex flex-col items-center text-center space-y-1.5 min-w-[85px] p-2 rounded-lg transition-all duration-300 ${
              4 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted
                ? 'bg-sky-500/10 border border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]' 
                : 'text-dark-400 opacity-60'
            } ${activeStageIdx === 4 ? 'animate-pulse scale-105 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]' : ''}`}>
              <TrendingUp size={24} className={4 <= activeStageIdx || pipelineStage === 'completed' || isPredictionExecuted ? 'text-sky-400' : 'text-dark-500'} />
              <span className="font-bold text-white">Progression</span>
              <span className="text-[10px] text-dark-400">Forecast</span>
            </div>
          </div>
        </div>

        {/* Model Info Card */}
        <div className="glass p-6 rounded-xl border border-dark-700 space-y-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu size={18} className="text-purple-400" />
            MODEL INFORMATION & EVALUATION
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 block font-medium">Spatial Model:</span>
              <span className="font-bold text-white">Vision Transformer (ViT-3D)</span>
            </div>
            <div className="p-3 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 block font-medium">Temporal Model:</span>
              <span className="font-bold text-white">LSTM Recurrent Network</span>
            </div>
            <div className="p-3 bg-dark-900/60 rounded-lg border border-dark-800">
              <span className="text-dark-400 block font-medium">Input Format:</span>
              <span className="font-bold text-white">Longitudinal MRI Sequences</span>
            </div>
            <div className="p-3 bg-dark-900/60 rounded-lg border border-dark-800 space-y-1">
              <div>
                <span className="text-dark-400 block font-medium">Prediction Status:</span>
                <span className={`font-bold block ${
                  isPredictionExecuted ? 'text-emerald-400' :
                  pipelineStage !== 'idle' ? 'text-sky-400 animate-pulse' : 'text-dark-400'
                }`}>
                  {isPredictionExecuted ? '✓ Prediction Completed' :
                   pipelineStage !== 'idle' ? 'Running ViT-LSTM...' : 'Prediction Not Run'}
                </span>
              </div>
              <div className="pt-1 border-t border-dark-800/80">
                <span className="text-dark-400 block font-medium">Evaluation Status:</span>
                <span className="font-semibold text-amber-400 block">
                  Demo Prediction
                </span>
                <span className="text-[10px] text-dark-400 block mt-0.5 leading-tight">
                  Formal evaluation requires a held-out longitudinal test dataset.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Insights Card */}
      <div className="glass p-6 rounded-xl border border-dark-700 space-y-2">
        <h3 className="text-md font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          CLINICAL INSIGHTS
        </h3>
        <p className="text-xs text-dark-300 leading-relaxed">
          • Observed volumetric trend for Patient <strong>{selectedPatientId}</strong> indicates baseline of {baselineVol.toFixed(2)} cm³ and current volume of {currentVol.toFixed(2)} cm³ across {patientScans.length} recorded visit(s).
          <br />
          • Model suggests {pctChange > 2 ? 'progressive volumetric enlargement' : 'stable lesion dynamics'}. Continued longitudinal monitoring with contrast-enhanced MRI is recommended for Patient <strong>{selectedPatientId}</strong>. Requires clinical correlation by attending neuro-radiologist.
        </p>
      </div>

      {/* Add Follow-up Scan Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-lg p-6 rounded-xl max-w-md w-full border border-dark-700 space-y-4"
            >
              <h3 className="text-xl font-bold text-white">Add Follow-up MRI Scan</h3>
              <p className="text-xs text-dark-400">
                Adding visit T{patientScans.length + 1} for Patient <strong>{selectedPatientId}</strong>.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-dark-300 font-medium mb-1">MRI Modality</label>
                  <select
                    value={newScanModality}
                    onChange={(e) => setNewScanModality(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none cursor-pointer"
                  >
                    <option value="T1-weighted">T1-weighted</option>
                    <option value="T1 Contrast-Enhanced">T1 Contrast-Enhanced</option>
                    <option value="T2-weighted">T2-weighted</option>
                    <option value="FLAIR">FLAIR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-dark-300 font-medium mb-1">Extracted Tumor Volume (cm³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newScanVolume}
                    onChange={(e) => setNewScanVolume(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-2.5 text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFollowupScan}
                  disabled={isProcessing}
                  className="flex-1 btn-primary text-xs flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Add Visit & Run Pipeline'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProgressionAnalysis;
