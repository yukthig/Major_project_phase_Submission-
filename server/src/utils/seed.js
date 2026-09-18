require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Scan = require('../models/Scan');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Scan.deleteMany({});
    
    console.log('Cleared existing data...');

    // Create users
    const adminUser = await User.create({
      name: 'Dr. Admin User',
      email: 'admin@neurovision.com',
      password: 'admin123',
      role: 'admin'
    });

    const regularUser = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@neurovision.com',
      password: 'user123',
      role: 'user'
    });

    console.log('Created users...');

    // Create sample scans with realistic data
    const tumorTypes = ['Glioma', 'Meningioma', 'Pituitary'];
    const locations = [
      'Right Temporal Lobe',
      'Frontal Lobe',
      'Left Hemisphere',
      'Parietal Lobe',
      'Occipital Lobe'
    ];
    const modalities = ['T1-weighted', 'T2-weighted', 'FLAIR', 'T1 Contrast-Enhanced'];
    const sources = ['BraTS', 'TCIA', 'Kaggle', 'Custom Upload'];
    const statuses = ['uploaded', 'preprocessed', 'segmented', 'reconstructed'];
    const models = ['U-Net', 'Attention U-Net', 'MONAI UNet'];

    const scans = [];
    const numScans = 12;

    for (let i = 0; i < numScans; i++) {
      const statusIndex = i % 4;
      const status = statuses[statusIndex];
      const userId = i % 2 === 0 ? regularUser._id : adminUser._id;

      const scanData = {
        patientId: `PAT-${String(1000 + i).padStart(4, '0')}`,
        userId,
        modality: modalities[i % modalities.length],
        source: sources[i % sources.length],
        imageUrl: '',
        status,
        preprocessingSteps: [
          { name: 'Brain Region Extraction', status: statusIndex >= 1 ? 'completed' : 'pending', completedAt: statusIndex >= 1 ? new Date() : null },
          { name: 'Noise Removal', status: statusIndex >= 1 ? 'completed' : 'pending', completedAt: statusIndex >= 1 ? new Date() : null },
          { name: 'Intensity Normalization', status: statusIndex >= 1 ? 'completed' : 'pending', completedAt: statusIndex >= 1 ? new Date() : null },
          { name: 'Resize & Resampling', status: statusIndex >= 1 ? 'completed' : 'pending', completedAt: statusIndex >= 1 ? new Date() : null },
          { name: 'Slice Extraction', status: statusIndex >= 1 ? 'completed' : 'pending', completedAt: statusIndex >= 1 ? new Date() : null }
        ],
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      };

      // Add segmentation data for segmented/reconstructed scans
      if (statusIndex >= 2) {
        const diceScore = 0.95 + Math.random() * 0.04;
        const confidence = 90 + Math.random() * 8;
        const volume = 5 + Math.random() * 25;

        scanData.modelUsed = models[i % models.length];
        scanData.tumorType = tumorTypes[i % tumorTypes.length];
        scanData.confidence = parseFloat(confidence.toFixed(1));
        scanData.volume = parseFloat(volume.toFixed(1));
        scanData.location = locations[i % locations.length];
        scanData.riskScore = i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low';
        scanData.segmentationMetrics = {
          diceScore: parseFloat(diceScore.toFixed(3)),
          iou: parseFloat((0.90 + Math.random() * 0.07).toFixed(3)),
          precision: parseFloat((0.92 + Math.random() * 0.06).toFixed(3)),
          recall: parseFloat((0.91 + Math.random() * 0.07).toFixed(3)),
          f1Score: parseFloat((0.91 + Math.random() * 0.07).toFixed(3))
        };
        scanData.surfaceArea = parseFloat((volume * 3.5).toFixed(1));
        scanData.maxDiameter = parseFloat((15 + Math.random() * 25).toFixed(1));
        scanData.inferenceTime = parseFloat((1.5 + Math.random() * 0.8).toFixed(1));
      }

      scans.push(scanData);
    }

    await Scan.insertMany(scans);
    console.log(`Created ${scans.length} sample scans...`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@neurovision.com / admin123');
    console.log('User: sarah@neurovision.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
