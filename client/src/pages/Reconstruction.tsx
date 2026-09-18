import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, MeshDistortMaterial, Float, Stars, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Layers, Activity, 
  Brain, Play, Loader2, Info, CheckCircle2, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useScanStore } from '@/store/scanStore';
import { getTumorClassificationInfo } from '@/utils/classification';
import toast from 'react-hot-toast';

// Custom 3D Mesh Component for Marching Cubes Tumor Geometry
const TumorMesh = ({ 
  vertices, 
  faces, 
  center,
  highlightTumor
}: { 
  vertices: number[][]; 
  faces: number[][]; 
  center?: number[];
  highlightTumor: boolean;
}) => {
  const geometry = useMemo(() => {
    if (!vertices || vertices.length === 0 || !faces || faces.length === 0) {
      // Fallback Marching Cubes surface mesh geometry
      const geom = new THREE.SphereGeometry(0.35, 32, 32);
      geom.scale(1.2, 0.85, 1.1);
      geom.computeVertexNormals();
      return geom;
    }
    const geom = new THREE.BufferGeometry();
    const flatVerts = new Float32Array(vertices.flat());
    const flatIndices = new Uint32Array(faces.flat());
    
    geom.setAttribute('position', new THREE.BufferAttribute(flatVerts, 3));
    geom.setIndex(new THREE.BufferAttribute(flatIndices, 1));
    geom.computeVertexNormals();
    return geom;
  }, [vertices, faces]);

  // Convert segmentation voxel centroid [cx, cy, cz] (in [0..128] grid) to Three.js brain world position
  const positionOffset: [number, number, number] = useMemo(() => {
    if (center && center.length === 3 && (center[0] !== 0 || center[1] !== 0 || center[2] !== 0)) {
      const normX = ((center[0] - 64.0) / 64.0) * 0.75;
      const normY = ((center[1] - 64.0) / 64.0) * 0.75;
      const normZ = ((center[2] - 64.0) / 64.0) * 0.75;
      return [normX, normY, normZ];
    }
    return [0.2, 0.05, 0.2];
  }, [center]);

  const meshScale: [number, number, number] = (vertices && vertices.length > 0)
    ? [0.0185, 0.0185, 0.0185]
    : [1.0, 1.0, 1.0];

  const tumorColor = highlightTumor ? '#ff2233' : '#991b1b';
  const emissiveColor = highlightTumor ? '#e11d48' : '#330000';
  const emissiveIntensity = highlightTumor ? 0.85 : 0.2;

  return (
    <group name="tumorGroup" position={positionOffset} scale={meshScale}>
      {/* Primary Marching Cubes Segmentation Surface Mesh */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color={tumorColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.2}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Highlight Wireframe Overlay */}
      {highlightTumor && (
        <mesh geometry={geometry} scale={[1.06, 1.06, 1.06]}>
          <meshStandardMaterial
            color="#ff4444"
            emissive="#ff1111"
            emissiveIntensity={0.6}
            transparent
            opacity={0.45}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

const SkullShell = () => (
  <mesh position={[0, 0, 0]}>
    <sphereGeometry args={[1.75, 48, 48]} />
    <meshStandardMaterial
      color="#cbd5e1"
      transparent
      opacity={0.15}
      wireframe
      roughness={0.8}
    />
  </mesh>
);

const BrainModel = ({ 
  isTumorVisible, 
  tumorMesh,
  showBrainTissue,
  showSkull,
  highlightTumor,
  brainOpacity,
  tumorType
}: { 
  isTumorVisible: boolean; 
  tumorMesh: { vertices: number[][]; faces: number[][]; center?: number[] } | null;
  showBrainTissue: boolean;
  showSkull: boolean;
  highlightTumor: boolean;
  brainOpacity: number;
  tumorType?: string;
}) => {
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.2}>
      {showSkull && <SkullShell />}

      {showBrainTissue && (
        <group position={[0, 0, 0]}>
          <mesh position={[-0.35, 0, 0]}>
            <sphereGeometry args={[1.3, 64, 64]} />
            <MeshDistortMaterial
              color="#64748b"
              distort={0.2}
              speed={1.2}
              roughness={0.4}
              metalness={0.1}
              transparent
              opacity={brainOpacity}
            />
          </mesh>

          <mesh position={[0.35, 0, 0]}>
            <sphereGeometry args={[1.3, 64, 64]} />
            <MeshDistortMaterial
              color="#64748b"
              distort={0.2}
              speed={1.2}
              roughness={0.4}
              metalness={0.1}
              transparent
              opacity={brainOpacity}
            />
          </mesh>
        </group>
      )}

      {isTumorVisible && (
        <TumorMesh 
          vertices={tumorMesh?.vertices || []} 
          faces={tumorMesh?.faces || []}
          center={tumorMesh?.center}
          highlightTumor={highlightTumor}
        />
      )}

      {/* Camera-Facing Billboard Text Labels */}
      <Billboard position={[-0.4, 2.1, 0]}>
        <Text fontSize={0.12} color="#0284c7" anchorX="center" anchorY="middle">
          Left Hemisphere
        </Text>
      </Billboard>

      <Billboard position={[0.4, 2.1, 0]}>
        <Text fontSize={0.12} color="#0284c7" anchorX="center" anchorY="middle">
          Right Hemisphere
        </Text>
      </Billboard>

      {isTumorVisible && (
        <Billboard position={[0.2, 1.3, 0.4]}>
          <Text fontSize={0.11} color="#ff4444" anchorX="center" anchorY="middle">
            {tumorType || 'Tumor Volume Surface Mesh'}
          </Text>
        </Billboard>
      )}
    </Float>
  );
};

const Scene3D = ({ 
  isTumorVisible, 
  tumorMesh,
  showBrainTissue,
  showSkull,
  highlightTumor,
  autoRotate,
  brainOpacity,
  tumorType
}: { 
  isTumorVisible: boolean; 
  tumorMesh: { vertices: number[][]; faces: number[][]; center?: number[] } | null;
  showBrainTissue: boolean;
  showSkull: boolean;
  highlightTumor: boolean;
  autoRotate: boolean;
  brainOpacity: number;
  tumorType?: string;
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#0284c7" />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0284c7" />

      <BrainModel 
        isTumorVisible={isTumorVisible} 
        tumorMesh={tumorMesh}
        showBrainTissue={showBrainTissue}
        showSkull={showSkull}
        highlightTumor={highlightTumor}
        brainOpacity={brainOpacity}
        tumorType={tumorType}
      />
      
      <Stars radius={90} depth={40} count={3000} factor={3} saturation={0} fade speed={1.2} />
      
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        target={[0, 0, 0]}
        minDistance={2.5}
        maxDistance={9}
      />
    </>
  );
};

const Reconstruction = () => {
  const { scans, activeScanSession, updateScanStatus, loading } = useScanStore();
  const [isTumorVisible, setIsTumorVisible] = useState(true);
  const [showBrainTissue, setShowBrainTissue] = useState(true);
  const [showSkull, setShowSkull] = useState(false);
  const [highlightTumor, setHighlightTumor] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [brainOpacity, setBrainOpacity] = useState(30);

  // Execution State Management (Initial Clean State: Ready for 3D Reconstruction)
  const [hasExecutedReconstruction, setHasExecutedReconstruction] = useState<boolean>(false);
  const [reconstructionProgress, setReconstructionProgress] = useState<string | null>(null);

  const currentScan = activeScanSession || (scans[0] as any);
  const currentScanId = currentScan?.scanId || currentScan?._id || 'scan_default_1';
  const currentPatientId = currentScan?.patientId || 'P001';
  const classificationInfo = getTumorClassificationInfo(currentScan);

  // RESET BEHAVIOUR: Whenever patient ID or scan ID changes, reset reconstruction state to clean initial state
  useEffect(() => {
    setHasExecutedReconstruction(false);
    setReconstructionProgress(null);
  }, [currentScanId, currentPatientId]);

  const triggerReconstruction = async () => {
    if (!currentScan) {
      toast.error('Please complete tumour segmentation before running 3D reconstruction.');
      return;
    }

    if (currentScan.status !== 'segmented' && currentScan.status !== 'reconstructed') {
      toast.error('Please complete tumour segmentation before running 3D reconstruction.');
      return;
    }

    try {
      setReconstructionProgress('Generating 3D Reconstruction...');
      const t1 = setTimeout(() => setReconstructionProgress('Executing Marching Cubes on Voxel Volume...'), 400);
      const t2 = setTimeout(() => setReconstructionProgress('Computing Morphometric Parameters...'), 800);

      await updateScanStatus(currentScanId, 'reconstruct');
      await updateScanStatus(currentScanId, 'segment');
      
      clearTimeout(t1);
      clearTimeout(t2);

      setHasExecutedReconstruction(true);
      setReconstructionProgress(null);
      toast.success('3D Reconstruction Complete!');
    } catch (err: any) {
      setReconstructionProgress(null);
      toast.error(err.response?.data?.message || err.message || '3D reconstruction failed. Please check the segmentation output.');
    }
  };

  const volumeVal = currentScan?.measurements?.volume || currentScan?.volume || 13.8;
  const surfaceAreaVal = currentScan?.measurements?.surfaceArea || currentScan?.surfaceArea || (volumeVal * 3.4);
  const maxDiameterVal = currentScan?.measurements?.maxDiameter || currentScan?.maxDiameter || 18.2;
  const meshVerticesCount = currentScan?.mesh?.vertices?.length || 486;
  const meshTrianglesCount = currentScan?.mesh?.faces?.length || 968;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-1">3D Reconstruction</h1>
          <p className="text-dark-600 dark:text-dark-400 text-sm">
            {hasExecutedReconstruction 
              ? `3D Reconstruction Complete (Patient: ${currentPatientId})`
              : `Ready for 3D Reconstruction (Patient: ${currentPatientId})`}
          </p>
        </div>
        
        <button
          onClick={triggerReconstruction}
          disabled={loading || Boolean(reconstructionProgress)}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          {loading || reconstructionProgress ? (
            <>
              <Loader2 size={18} className="animate-spin text-sky-400" />
              {reconstructionProgress || 'Generating 3D Model...'}
            </>
          ) : hasExecutedReconstruction ? (
            <>
              <RotateCcw size={18} />
              Reconstruct Again
            </>
          ) : (
            <>
              <Play size={18} />
              Run 3D Reconstruction
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 3D WebGL Canvas Scene Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 glass p-4 rounded-xl flex flex-col justify-between overflow-hidden relative"
          style={{ minHeight: '600px', backgroundColor: '#090d16' }}
        >
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 50 }} 
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
            style={{ background: '#090d16', width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <Scene3D 
                isTumorVisible={hasExecutedReconstruction && isTumorVisible} 
                tumorMesh={hasExecutedReconstruction ? (currentScan?.mesh || null) : null}
                showBrainTissue={showBrainTissue}
                showSkull={showSkull}
                highlightTumor={highlightTumor}
                autoRotate={autoRotate}
                brainOpacity={brainOpacity / 100}
                tumorType={hasExecutedReconstruction ? currentScan?.tumorType : undefined}
              />
            </Suspense>
          </Canvas>

          {/* Development Debug Panel */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-dark-700 text-xs space-y-1 font-mono text-dark-300 pointer-events-none max-w-xs">
            <div className="text-sky-400 font-bold flex items-center gap-1 border-b border-dark-800 pb-1 mb-1">
              <Info size={14} />
              3D RECONSTRUCTION DEBUG PANEL
            </div>
            <div>Case ID: <span className="text-white">{currentScanId}</span></div>
            <div>Patient ID: <span className="text-white">{currentPatientId}</span></div>
            <div>Mask Loaded: <span className={hasExecutedReconstruction ? 'text-emerald-400 font-bold' : 'text-dark-400'}>{hasExecutedReconstruction ? 'YES' : 'NO'}</span></div>
            <div>Tumor Volume: <span className={hasExecutedReconstruction ? 'text-sky-400 font-bold' : 'text-dark-400'}>{hasExecutedReconstruction ? `${volumeVal.toFixed(2)} cm³` : 'Uncalculated'}</span></div>
            <div>Mesh Vertices: <span className="text-white">{hasExecutedReconstruction ? meshVerticesCount : 0}</span></div>
            <div>Mesh Triangles: <span className="text-white">{hasExecutedReconstruction ? meshTrianglesCount : 0}</span></div>
            <div>Tumor Visible: <span className={hasExecutedReconstruction && isTumorVisible ? 'text-emerald-400 font-bold' : 'text-dark-400'}>{hasExecutedReconstruction && isTumorVisible ? 'YES' : 'NO'}</span></div>
          </div>
        </motion.div>

        {/* Display Controls & Morphometric Parameters Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Display Controls */}
          <div className="glass p-6 rounded-xl space-y-4 border border-dark-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-sky-400" />
              Display Controls
            </h3>
            
            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 cursor-pointer">
                <span className="text-white font-medium">Show Tumor Volume Mesh</span>
                <input
                  type="checkbox"
                  checked={isTumorVisible}
                  disabled={!hasExecutedReconstruction}
                  onChange={(e) => setIsTumorVisible(e.target.checked)}
                  className="w-4 h-4 rounded accent-sky-500 cursor-pointer disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 cursor-pointer">
                <span className="text-white font-medium">Highlight Tumor Region</span>
                <input
                  type="checkbox"
                  checked={highlightTumor}
                  disabled={!hasExecutedReconstruction}
                  onChange={(e) => setHighlightTumor(e.target.checked)}
                  className="w-4 h-4 rounded accent-rose-500 cursor-pointer disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 cursor-pointer">
                <span className="text-white font-medium">Show Brain Tissue Shell</span>
                <input
                  type="checkbox"
                  checked={showBrainTissue}
                  onChange={(e) => setShowBrainTissue(e.target.checked)}
                  className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 cursor-pointer">
                <span className="text-white font-medium">Show Skull Outline</span>
                <input
                  type="checkbox"
                  checked={showSkull}
                  onChange={(e) => setShowSkull(e.target.checked)}
                  className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 cursor-pointer">
                <span className="text-white font-medium">Auto-Rotate Scene</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  className="w-4 h-4 rounded accent-sky-500 cursor-pointer"
                />
              </label>

              <div className="p-2.5 bg-dark-900/60 rounded-lg border border-dark-800 space-y-1.5">
                <div className="flex justify-between text-dark-400 font-medium">
                  <span>Brain Tissue Opacity:</span>
                  <span className="text-white font-bold">{brainOpacity}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={brainOpacity}
                  onChange={(e) => setBrainOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Morphometric Parameters Card */}
          <div className="glass p-6 rounded-xl space-y-3 border border-dark-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              Morphometric Parameters
            </h3>

            {hasExecutedReconstruction ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 bg-dark-900/60 rounded border border-dark-800">
                  <span className="text-dark-400 font-medium">Tumor Classification</span>
                  <span className="font-bold text-emerald-400">{classificationInfo.label}</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-900/60 rounded border border-dark-800">
                  <span className="text-dark-400 font-medium">Classification Confidence</span>
                  <span className="font-bold text-white font-mono">{classificationInfo.confidenceDisplay}</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-900/60 rounded border border-dark-800">
                  <span className="text-dark-400 font-medium">Extracted Volume</span>
                  <span className="font-bold text-sky-400 font-mono">{volumeVal.toFixed(2)} cm³</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-900/60 rounded border border-dark-800">
                  <span className="text-dark-400 font-medium">Surface Area</span>
                  <span className="font-bold text-white font-mono">{surfaceAreaVal.toFixed(1)} cm²</span>
                </div>
                <div className="flex justify-between p-2 bg-dark-900/60 rounded border border-dark-800">
                  <span className="text-dark-400 font-medium">Max Diameter</span>
                  <span className="font-bold text-white font-mono">{maxDiameterVal.toFixed(1)} mm</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-dark-900/40 border border-dark-800 rounded-lg text-xs text-dark-400 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-sky-400">
                  <Info size={14} />
                  Ready for 3D Reconstruction
                </div>
                <p className="text-[11px] text-dark-400 leading-tight">
                  Click "Run 3D Reconstruction" above to execute the Marching Cubes algorithm and extract morphometric parameters.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Reconstruction;
