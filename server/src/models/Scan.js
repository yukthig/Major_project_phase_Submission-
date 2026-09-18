const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  modality: {
    type: String,
    enum: ['T1-weighted', 'T2-weighted', 'FLAIR', 'T1 Contrast-Enhanced'],
    required: true
  },
  source: {
    type: String,
    enum: ['BraTS', 'TCIA', 'Kaggle', 'Hugging Face', 'Custom Upload'],
    default: 'Custom Upload'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['uploaded', 'preprocessed', 'segmented', 'reconstructed'],
    default: 'uploaded'
  },
  preprocessingSteps: [{
    name: String,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed'],
      default: 'pending'
    },
    completedAt: Date
  }],
  segmentationMetrics: {
    diceScore: Number,
    iou: Number,
    precision: Number,
    recall: Number,
    f1Score: Number
  },
  modelUsed: {
    type: String,
    enum: ['U-Net', 'Attention U-Net', 'MONAI UNet'],
    default: 'U-Net'
  },
  tumorType: {
    type: String,
    enum: ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor'],
    default: 'No Tumor'
  },
  confidence: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    default: ''
  },
  riskScore: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  surfaceArea: {
    type: Number,
    default: 0
  },
  maxDiameter: {
    type: Number,
    default: 0
  },
  inferenceTime: {
    type: Number,
    default: 0
  },
  // Marching Cubes 3D Mesh Details
  mesh: {
    vertices: { type: [[Number]], default: [] },
    faces: { type: [[Number]], default: [] },
    normals: { type: [[Number]], default: [] },
    center: { type: [Number], default: [0, 0, 0] }
  },
  // Spatiotemporal progression data
  progression: {
    predictedVolume: { type: Number, default: 0 },
    progressionCategory: { type: String, default: '' },
    confidence: { type: Number, default: 0 },
    historicalVolumes: { type: [Number], default: [] },
    projectedVolumes: { type: [Number], default: [] },
    growthPercentage: { type: Number, default: 0 },
    growthRate: { type: Number, default: 0 }
  },
  // Explainability reports and overlays
  xai: {
    raw_slice_b64: { type: String, default: '' },
    mask_slice_b64: { type: String, default: '' },
    gradcam_b64: { type: String, default: '' },
    vit_attn_b64: { type: String, default: '' },
    explanation: { type: String, default: '' }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

scanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Scan', scanSchema);
