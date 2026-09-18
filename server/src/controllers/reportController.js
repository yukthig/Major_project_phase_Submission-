const Report = require('../models/Report');
const Scan = require('../models/Scan');

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id })
      .populate('scanId', 'patientId modality tumorType')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createReport = async (req, res) => {
  try {
    const { scanId } = req.body;
    
    const scan = await Scan.findOne({
      _id: scanId,
      userId: req.user._id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    const reportContent = {
      patientId: scan.patientId,
      modality: scan.modality,
      source: scan.source,
      modelUsed: scan.modelUsed,
      tumorType: scan.tumorType,
      confidence: scan.confidence,
      metrics: scan.segmentationMetrics,
      volume: scan.volume,
      location: scan.location,
      riskScore: scan.riskScore,
      recommendation: scan.tumorType !== 'No Tumor' 
        ? `Recommended specialist review for ${scan.tumorType} detection with ${scan.confidence}% confidence.`
        : 'No tumor detected. Routine follow-up recommended.',
      generatedAt: new Date()
    };

    const report = await Report.create({
      userId: req.user._id,
      scanId,
      patientId: scan.patientId,
      content: reportContent
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
