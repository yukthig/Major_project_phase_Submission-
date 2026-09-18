export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface SegmentationMetrics {
  diceScore: number;
  iou: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface PreprocessingStep {
  name: string;
  status: 'pending' | 'running' | 'completed';
  completedAt: string | null;
}

export interface ScanMesh {
  vertices: number[][];
  faces: number[][];
  normals: number[][];
  center: number[];
}

export interface ScanProgression {
  hasSufficientData?: boolean;
  message?: string;
  patientId?: string;
  historicalScansCount?: number;
  predictedVolume: number;
  progressionCategory: string;
  confidence: number;
  historicalVolumes: number[];
  projectedVolumes: number[];
  growthPercentage: number;
  growthRate: number;
}

export interface ScanXAI {
  raw_slice_b64: string;
  mask_slice_b64: string;
  gradcam_b64: string;
  vit_attn_b64: string;
  explanation: string;
  sliceCount?: number;
}

export interface ScanMeasurements {
  volume: number;          // cm³
  surfaceArea: number;     // cm²
  maxDiameter: number;     // mm
  centroid: [number, number, number];
  boundingBox: [number, number, number]; // w, h, d in mm
  verticesCount: number;
  triangleCount: number;
}

export interface ScanSession {
  scanId: string;
  patientId: string;
  uploadedFile: string;
  originalFileName?: string;
  modality: string;
  source: string;
  status: 'uploaded' | 'preprocessed' | 'segmented' | 'reconstructed';
  tumorType: string;
  classificationLabel?: string;
  classificationConfidence?: number;
  classificationModel?: string;
  confidence: number;
  location: string;
  riskScore: 'Low' | 'Medium' | 'High';
  metrics: SegmentationMetrics;
  measurements: ScanMeasurements;
  mesh: ScanMesh;
  xai?: ScanXAI;
  progression?: ScanProgression;
  clinicalSummary: string;
  createdAt: string;
}

export interface Scan {
  _id: string;
  scanId?: string;
  patientId: string;
  userId: string;
  modality: 'T1-weighted' | 'T2-weighted' | 'FLAIR' | 'T1 Contrast-Enhanced' | string;
  source: 'BraTS' | 'TCIA' | 'Kaggle' | 'Hugging Face' | 'Custom Upload' | string;
  imageUrl: string;
  status: 'uploaded' | 'preprocessed' | 'segmented' | 'reconstructed';
  preprocessingSteps: PreprocessingStep[];
  segmentationMetrics?: SegmentationMetrics;
  modelUsed?: 'U-Net' | 'Attention U-Net' | 'MONAI UNet' | string;
  classificationLabel?: string;
  classificationConfidence?: number;
  classificationModel?: string;
  tumorType?: 'Glioma' | 'Meningioma' | 'Pituitary' | 'No Tumor' | 'Low-Grade Glioma' | 'Pituitary Adenoma' | string;
  confidence?: number;
  location?: string;
  riskScore?: 'Low' | 'Medium' | 'High';
  surfaceArea?: number;
  maxDiameter?: number;
  inferenceTime?: number;
  mesh?: ScanMesh;
  progression?: ScanProgression;
  xai?: ScanXAI;
  createdAt: string;
  updatedAt?: string;
}

export interface ScanState {
  scans: Scan[];
  selectedScan: Scan | null;
  activeScanSession: ScanSession | null;
  loading: boolean;
  fetchScans: () => Promise<void>;
  addScan: (scan: Partial<Scan>) => Promise<any>;
  createScan: (scan: Partial<Scan>) => Promise<any>;
  updateScanStatus: (id: string, action: string) => Promise<void>;
  predictProgression: (id: string) => Promise<void>;
  explainScan: (id: string, sliceIdx?: number) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  setSelectedScan: (scan: Scan | null) => void;
  setActiveScanSession: (session: ScanSession | null) => void;
  resetScanSession: () => void;
}

export interface Report {
  _id: string;
  userId: string;
  scanId: string;
  patientId: string;
  content: any;
  createdAt: string;
}

export interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}
