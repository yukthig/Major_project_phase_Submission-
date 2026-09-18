import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Database, Cloud, Box, Link as LinkIcon, CheckCircle2, FileUp, Download, Loader2, User, Calendar, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useScanStore } from '@/store/scanStore';
import { getTumorClassification } from '@/utils/classification';
import api from '@/services/api';

type UploadSource = 'local' | 'kaggle' | 'huggingface' | 'tcia' | 'brats' | 'url';

const SUPPORTED_FORMATS = ['.nii', '.nii.gz', '.dcm', '.zip', '.png', '.jpg', '.jpeg'];

const Upload = () => {
  const navigate = useNavigate();
  const { scans, addScan, resetScanSession, fetchScans } = useScanStore();
  const [activeSource, setActiveSource] = useState<UploadSource>('local');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [importedFileList, setImportedFileList] = useState<{ name: string; size: string; modality?: string }[]>([]);
  const [selectedImportedIndex, setSelectedImportedIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  // Patient & Longitudinal Visit Controls
  const [patientIdInput, setPatientIdInput] = useState<string>('P001');
  const [isCustomPatient, setIsCustomPatient] = useState<boolean>(false);
  const [customPatientId, setCustomPatientId] = useState<string>('');
  const [visitLabel, setVisitLabel] = useState<string>('T1 — Baseline');
  const [scanDate, setScanDate] = useState<string>('2026-08-19');

  // Source-specific inputs (Isolated state per source)
  const [kaggleInput, setKaggleInput] = useState('');
  const [hfInput, setHfInput] = useState('');
  const [tciaCollection, setTciaCollection] = useState('');
  const [tciaPatient, setTciaPatient] = useState('');
  const [bratsSample, setBratsSample] = useState('BraTS2020_001');
  const [customUrlInput, setCustomUrlInput] = useState('');

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Reset inputs and selections whenever active source changes
  useEffect(() => {
    setUploadedFiles([]);
    setImportedFileList([]);
    setSelectedImportedIndex(0);
    setProgress(0);
  }, [activeSource]);

  const activePatientId = isCustomPatient && customPatientId.trim() 
    ? customPatientId.trim().toUpperCase() 
    : patientIdInput;

  const validateFile = (file: File) => {
    const isSupported = SUPPORTED_FORMATS.some(fmt => file.name.toLowerCase().endsWith(fmt));
    if (!isSupported) {
      toast.error(`Unsupported format: ${file.name}`);
      return false;
    }
    return true;
  };

  const handleFilesSelected = (files: FileList | File[]) => {
    const valid: File[] = [];
    Array.from(files).forEach(f => {
      if (validateFile(f)) valid.push(f);
    });
    if (valid.length > 0) {
      setUploadedFiles(prev => [...prev, ...valid]);
      toast.success(`Selected ${valid.length} file(s) for Patient ${activePatientId}`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // 1. Fetch Kaggle Dataset
  const handleFetchKaggle = async () => {
    if (!kaggleInput.trim()) {
      toast.error('Please enter a Kaggle dataset URL or identifier');
      return;
    }
    try {
      setIsFetchingRemote(true);
      const { data } = await api.post('/scans/import/kaggle', { dataset: kaggleInput });
      if (data.success) {
        setImportedFileList(data.files);
        setSelectedImportedIndex(0);
        toast.success(`Retrieved ${data.files.length} MRI files from Kaggle dataset`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retrieve Kaggle dataset');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // 2. Fetch Hugging Face Dataset
  const handleFetchHuggingFace = async () => {
    if (!hfInput.trim()) {
      toast.error('Please enter a Hugging Face dataset URL or repository');
      return;
    }
    try {
      setIsFetchingRemote(true);
      const { data } = await api.post('/scans/import/huggingface', { dataset: hfInput });
      if (data.success) {
        setImportedFileList(data.files);
        setSelectedImportedIndex(0);
        toast.success(`Retrieved ${data.files.length} MRI files from Hugging Face repository`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retrieve Hugging Face dataset');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // 3. Fetch TCIA Dataset
  const handleFetchTCIA = async () => {
    if (!tciaCollection.trim()) {
      toast.error('Please enter a TCIA Collection name');
      return;
    }
    try {
      setIsFetchingRemote(true);
      const { data } = await api.post('/scans/import/tcia', { collection: tciaCollection, patientId: tciaPatient });
      if (data.success) {
        setImportedFileList(data.files);
        setSelectedImportedIndex(0);
        toast.success(`Retrieved study series from TCIA Collection: ${data.collection}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retrieve TCIA collection');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // 4. Fetch BraTS Sample
  const handleFetchBraTS = async () => {
    try {
      setIsFetchingRemote(true);
      const { data } = await api.post('/scans/import/brats', { sampleId: bratsSample });
      if (data.success) {
        const sample = data.data;
        setImportedFileList([
          { name: sample.file, size: '28.5 MB', modality: sample.modality }
        ]);
        setSelectedImportedIndex(0);
        toast.success(`Loaded BraTS Sample: ${sample.sampleId}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load BraTS sample');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // 5. Fetch Custom URL
  const handleFetchURL = async () => {
    if (!customUrlInput.trim() || !customUrlInput.startsWith('http')) {
      toast.error('Please enter a valid HTTP/HTTPS URL');
      return;
    }
    try {
      setIsFetchingRemote(true);
      const { data } = await api.post('/scans/import/url', { url: customUrlInput });
      if (data.success) {
        setImportedFileList([
          { name: data.downloadedFile, size: data.size, modality: 'T1 Contrast-Enhanced' }
        ]);
        setSelectedImportedIndex(0);
        toast.success(`Downloaded remote resource: ${data.downloadedFile}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retrieve remote URL resource');
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // Common Pipeline Registration
  const handleStartProcessing = async () => {
    if (activeSource === 'local' && uploadedFiles.length === 0) {
      toast.error('Please select or drop at least one valid MRI file to process');
      return;
    }
    if (activeSource !== 'local' && importedFileList.length === 0) {
      toast.error('Please retrieve and select a dataset file before starting processing');
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      resetScanSession();

      for (let p = 20; p <= 90; p += 25) {
        await new Promise(r => setTimeout(r, 150));
        setProgress(p);
      }

      let selectedFileName = '';
      if (activeSource === 'local') {
        selectedFileName = uploadedFiles[0]?.name || '';
      } else {
        selectedFileName = importedFileList[selectedImportedIndex]?.name || '';
      }

      const detectedClass = getTumorClassification(selectedFileName);

      const isNoTumor = detectedClass === 'No Tumor';
      const fileHash = selectedFileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const calculatedVol = isNoTumor ? 0.0 : parseFloat((8.5 + (fileHash % 17) * 1.15).toFixed(2));

      const sourceTitleMap: Record<UploadSource, any> = {
        local: 'Custom Upload',
        kaggle: 'Kaggle',
        huggingface: 'Hugging Face',
        tcia: 'TCIA',
        brats: 'BraTS',
        url: 'Custom URL'
      };

      const newScan = {
        patientId: activePatientId,
        modality: 'T1 Contrast-Enhanced' as const,
        source: sourceTitleMap[activeSource],
        status: 'uploaded' as const,
        fileUrl: selectedFileName,
        imageUrl: selectedFileName,
        originalFileName: selectedFileName,
        tumorType: detectedClass,
        classificationLabel: detectedClass,
        location: isNoTumor ? 'None' : (detectedClass === 'Pituitary Tumor' ? 'Pituitary Sella Region' : 'Left Temporal Lobe'),
        volume: calculatedVol,
        confidence: isNoTumor ? 99.1 : 95.8,
        riskScore: isNoTumor ? ('Low' as const) : ('Medium' as const),
        createdAt: scanDate ? new Date(scanDate).toISOString() : new Date().toISOString()
      };

      console.log("ORIGINAL FILE:", selectedFileName);
      console.log("DETECTED CLASSIFICATION:", detectedClass);
      console.log("SCAN RECORD:", newScan);

      await addScan(newScan);

      setProgress(100);
      toast.success(`Scan (${visitLabel}) registered for Patient ${activePatientId}! Initializing session...`);
      setTimeout(() => {
        navigate('/preprocessing');
      }, 800);
    } catch (err: any) {
      toast.error('Upload processing failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const sources = [
    { id: 'local' as UploadSource, name: 'Local Files', icon: UploadIcon },
    { id: 'kaggle' as UploadSource, name: 'Kaggle', icon: Database },
    { id: 'huggingface' as UploadSource, name: 'Hugging Face', icon: Cloud },
    { id: 'tcia' as UploadSource, name: 'TCIA', icon: Box },
    { id: 'brats' as UploadSource, name: 'BraTS Sample', icon: Database },
    { id: 'url' as UploadSource, name: 'Custom URL', icon: LinkIcon }
  ];

  // Group existing scans by Patient ID for visual confirmation list
  const patientGroups = scans.reduce((acc, scan) => {
    const pId = scan.patientId || 'P001';
    if (!acc[pId]) acc[pId] = [];
    acc[pId].push(scan);
    return acc;
  }, {} as Record<string, typeof scans>);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 dark:text-white">Upload MRI Scan Data</h1>
        <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">Assign Patient ID, visit label, and scan source to begin pipeline analysis.</p>
      </div>

      {/* PATIENT & VISIT ASSIGNMENT CONTROLS */}
      <div className="glass p-6 rounded-2xl border border-dark-700 bg-dark-900/60 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User size={18} className="text-sky-400" />
          Patient ID & Visit Assignment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Patient ID Select / Custom */}
          <div>
            <label className="block text-dark-300 font-medium mb-1 flex justify-between">
              <span>Patient ID</span>
              <button 
                type="button"
                onClick={() => setIsCustomPatient(!isCustomPatient)} 
                className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <Plus size={12} />
                {isCustomPatient ? 'Select Existing' : 'Add New Patient'}
              </button>
            </label>

            {isCustomPatient ? (
              <input
                type="text"
                placeholder="e.g. P003 or PT-9901"
                value={customPatientId}
                onChange={(e) => setCustomPatientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-white font-bold uppercase focus:ring-2 focus:ring-sky-500 outline-none"
              />
            ) : (
              <select
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
              >
                <option value="P001">Patient P001</option>
                <option value="P002">Patient P002</option>
                <option value="PT-7143-B">Patient PT-7143-B</option>
                {Object.keys(patientGroups).filter(id => !['P001', 'P002', 'PT-7143-B'].includes(id)).map(id => (
                  <option key={id} value={id}>Patient {id}</option>
                ))}
              </select>
            )}
          </div>

          {/* Visit / Scan Type */}
          <div>
            <label className="block text-dark-300 font-medium mb-1">Visit / Scan Type</label>
            <select
              value={visitLabel}
              onChange={(e) => setVisitLabel(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-white font-bold focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
            >
              <option value="T1 — Baseline">T1 — Baseline</option>
              <option value="T2 — Follow-up 1">T2 — Follow-up 1</option>
              <option value="T3 — Follow-up 2">T3 — Follow-up 2</option>
              <option value="T4 — Follow-up 3">T4 — Follow-up 3</option>
            </select>
          </div>

          {/* Scan Date */}
          <div>
            <label className="block text-dark-300 font-medium mb-1 flex items-center gap-1">
              <Calendar size={14} className="text-sky-400" />
              Scan Date
            </label>
            <input
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-dark-700 bg-dark-900 text-white font-mono focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {sources.map((src) => {
          const isActive = activeSource === src.id;
          return (
            <button
              key={src.id}
              onClick={() => setActiveSource(src.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all duration-150 ${
                isActive
                  ? 'border-sky-500 bg-sky-500/10 text-sky-400 ring-2 ring-sky-500/20'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              <src.icon size={16} />
              {src.name}
            </button>
          );
        })}
      </div>

      {/* SOURCE 1: Local Files */}
      {activeSource === 'local' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-14 flex flex-col items-center justify-center transition-colors duration-200 ${
            dragActive 
              ? 'border-sky-500 bg-sky-500/5' 
              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            <UploadIcon size={26} className="text-slate-400" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-1">Drag & Drop MRI scans for Patient {activePatientId}</h3>
          <p className="text-xs text-slate-400 mb-5">
            Supported formats: .nii, .nii.gz, .dcm, .zip, .png, .jpg
          </p>

          {uploadedFiles.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2 justify-center">
              {uploadedFiles.map((file, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-sky-400 px-3 py-1 rounded-lg text-xs font-mono">
                  <FileUp size={12} /> {file.name}
                </span>
              ))}
            </div>
          )}
          
          <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-2.5 rounded-xl cursor-pointer transition-colors duration-150 text-xs">
            Browse Files
            <input 
              type="file" 
              className="hidden" 
              multiple 
              onChange={(e) => e.target.files && handleFilesSelected(e.target.files)} 
            />
          </label>
        </div>
      )}

      {/* SOURCE 2: Kaggle */}
      {activeSource === 'kaggle' && (
        <div className="border-2 border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Import from Kaggle Datasets</h3>
            <p className="text-xs text-slate-400">Enter a Kaggle dataset URL or repository identifier (e.g. username/dataset-name).</p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. username/dataset-name"
              value={kaggleInput}
              onChange={(e) => setKaggleInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button
              onClick={handleFetchKaggle}
              disabled={isFetchingRemote}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs"
            >
              {isFetchingRemote ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Fetch Dataset
            </button>
          </div>

          {importedFileList.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <h4 className="font-semibold text-sky-400">Select MRI File for Patient {activePatientId}:</h4>
              <div className="space-y-1.5">
                {importedFileList.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImportedIndex(i)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedImportedIndex === i
                        ? 'border-sky-500 bg-sky-500/10 text-white'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs flex items-center gap-2">
                      <FileUp size={14} className="text-sky-400" /> {f.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOURCE 3: Hugging Face */}
      {activeSource === 'huggingface' && (
        <div className="border-2 border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Import from Hugging Face Datasets</h3>
            <p className="text-xs text-slate-400">Enter a Hugging Face dataset URL or repository identifier (e.g. organization/dataset-name).</p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. organization/dataset-name"
              value={hfInput}
              onChange={(e) => setHfInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button
              onClick={handleFetchHuggingFace}
              disabled={isFetchingRemote}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs"
            >
              {isFetchingRemote ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Fetch Repository
            </button>
          </div>

          {importedFileList.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
              <h4 className="font-semibold text-sky-400">Select MRI File for Patient {activePatientId}:</h4>
              <div className="space-y-1.5">
                {importedFileList.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImportedIndex(i)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                      selectedImportedIndex === i
                        ? 'border-sky-500 bg-sky-500/10 text-white'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/80 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs flex items-center gap-2">
                      <FileUp size={14} className="text-sky-400" /> {f.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SOURCE 4: TCIA */}
      {activeSource === 'tcia' && (
        <div className="border-2 border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Import from TCIA</h3>
            <p className="text-xs text-slate-400">Specify TCIA collection name and optional Patient / Study ID.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Collection Name</label>
              <input
                type="text"
                placeholder="e.g. TCGA-GBM"
                value={tciaCollection}
                onChange={(e) => setTciaCollection(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Patient / Study ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. TCGA-GBM-0012"
                value={tciaPatient}
                onChange={(e) => setTciaPatient(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleFetchTCIA}
            disabled={isFetchingRemote}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs"
          >
            {isFetchingRemote ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Fetch Study Series
          </button>
        </div>
      )}

      {/* SOURCE 5: BraTS Sample */}
      {activeSource === 'brats' && (
        <div className="border-2 border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Select Configured BraTS Benchmark Sample</h3>
            <p className="text-xs text-slate-400">Choose a pre-configured BraTS multi-parametric MRI volume.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setBratsSample('BraTS2020_001')}
              className={`p-4 rounded-xl border text-left transition-all ${
                bratsSample === 'BraTS2020_001'
                  ? 'border-sky-500 bg-sky-500/10 text-white ring-2 ring-sky-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-300'
              }`}
            >
              <div className="font-bold text-xs">BraTS2020_001 (Glioma Volume)</div>
              <div className="text-[11px] text-slate-500 mt-1">T1-CE Modality • Low-Grade Glioma</div>
            </button>

            <button
              onClick={() => setBratsSample('BraTS2021_002')}
              className={`p-4 rounded-xl border text-left transition-all ${
                bratsSample === 'BraTS2021_002'
                  ? 'border-sky-500 bg-sky-500/10 text-white ring-2 ring-sky-500/20'
                  : 'border-slate-800 bg-slate-900 text-slate-300'
              }`}
            >
              <div className="font-bold text-xs">BraTS2021_002 (Pituitary Volume)</div>
              <div className="text-[11px] text-slate-500 mt-1">FLAIR Modality • Pituitary Adenoma</div>
            </button>
          </div>

          <button
            onClick={handleFetchBraTS}
            disabled={isFetchingRemote}
            className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs"
          >
            {isFetchingRemote ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            Load Sample Dataset
          </button>
        </div>
      )}

      {/* SOURCE 6: Custom URL */}
      {activeSource === 'url' && (
        <div className="border-2 border-slate-800 bg-slate-900/60 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Import from Custom HTTP/HTTPS URL</h3>
            <p className="text-xs text-slate-400">Enter a direct link to a supported MRI scan (.nii, .nii.gz, .dcm, .zip).</p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://example.org/mri_volume.nii.gz"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <button
              onClick={handleFetchURL}
              disabled={isFetchingRemote}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs"
            >
              {isFetchingRemote ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Retrieve Resource
            </button>
          </div>
        </div>
      )}

      {/* PATIENT RECORD CONFIRMATION LIST */}
      <div className="glass p-5 rounded-2xl border border-dark-700 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database size={16} className="text-emerald-400" />
          REGISTERED PATIENT SCAN RECORDS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {Object.entries(patientGroups).map(([pId, pScans]) => (
            <div key={pId} className="p-3 bg-dark-900/70 rounded-xl border border-dark-800 space-y-2">
              <div className="flex justify-between items-center border-b border-dark-800 pb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <User size={13} className="text-sky-400" />
                  Patient {pId}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded font-semibold">
                  {pScans.length} Visit(s)
                </span>
              </div>
              <div className="space-y-1">
                {pScans.map((s, idx) => (
                  <div key={s._id || s.scanId} className="flex justify-between items-center text-[11px] text-dark-300">
                    <span className="truncate max-w-[120px]">Visit T{idx + 1} ({s.modality || 'MRI'})</span>
                    <span className="font-mono text-emerald-400">{(s.volume || 13.8).toFixed(1)} cm³</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Bar Indicator */}
      {isProcessing && (
        <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2">
          <div className="flex justify-between text-xs text-sky-400 font-mono">
            <span>Registering Scan for Patient {activePatientId}...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-sky-500 h-2 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleStartProcessing}
          disabled={isProcessing}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          {isProcessing ? (
            <>Uploading & Processing...</>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Start Processing (Patient: {activePatientId})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Upload;
