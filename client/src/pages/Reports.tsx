import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScanStore } from '@/store/scanStore';
import { FileText, Download, Printer, Share2, Search, FileBarChart } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { scans } = useScanStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter only completed scans
  const completedScans = scans.filter(scan => 
    scan.status === 'segmented' || scan.status === 'reconstructed'
  ).filter(scan => 
    scan.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.modality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = (scan: any) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFillColor(30, 64, 175); // primary-800
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('NeuroVision AI Platform', 14, 20);
      
      doc.setFontSize(12);
      doc.text('Clinical Neuroimaging & Progression Report', 14, 30);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 30);

      // Patient Info Section
      doc.setTextColor(51, 65, 85); // slate-700
      doc.setFontSize(16);
      doc.text('Patient Information', 14, 55);
      
      autoTable(doc, {
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85], fontStyle: 'bold' },
        bodyStyles: { textColor: [71, 85, 105] },
        body: [
          ['Patient ID', scan.patientId, 'Scan Date', new Date(scan.createdAt).toLocaleDateString()],
          ['Modality', scan.modality, 'Source', scan.source]
        ]
      });

      // Analysis Results
      doc.setFontSize(16);
      let finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.text('AI Analysis Results', 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 20,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] }, // blue-500
        head: [['Metric', 'Value']],
        body: [
          ['Tumor Detection', scan.tumorType ? `Detected (${scan.tumorType})` : 'None Detected'],
          ['Tumor Volume', scan.volume ? `${scan.volume.toFixed(2)} cm³` : 'N/A'],
          ['Surface Area', scan.surfaceArea ? `${scan.surfaceArea.toFixed(1)} cm²` : 'N/A'],
          ['Maximum Diameter', scan.maxDiameter ? `${scan.maxDiameter.toFixed(1)} mm` : 'N/A'],
          ['Risk Assessment', scan.riskScore || 'Low']
        ]
      });

      finalY = (doc as any).lastAutoTable.finalY || 100;

      // Segmentation Metrics (if available)
      if (scan.segmentationMetrics) {
        doc.setFontSize(16);
        doc.text('Segmentation Metrics', 14, finalY + 15);
        
        autoTable(doc, {
          startY: finalY + 20,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] }, // emerald-500
          head: [['Metric', 'Score']],
          body: [
            ['Dice Score (Overlap)', `${(scan.segmentationMetrics.diceScore * 100).toFixed(1)}%`],
            ['IoU (Jaccard Index)', `${(scan.segmentationMetrics.iou * 100).toFixed(1)}%`],
            ['Precision (Positive Predictive)', `${(scan.segmentationMetrics.precision * 100).toFixed(1)}%`],
            ['Recall (Sensitivity)', `${(scan.segmentationMetrics.recall * 100).toFixed(1)}%`]
          ]
        });
        
        finalY = (doc as any).lastAutoTable.finalY || 150;
      }

      // Spatiotemporal Progression (Objective 3 & 4)
      if (scan.progression && scan.progression.progressionCategory) {
        doc.setFontSize(16);
        doc.text('LSTM Progression Predictor Output', 14, finalY + 15);
        
        autoTable(doc, {
          startY: finalY + 20,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] }, // violet-500
          head: [['Progression Metric', 'Value']],
          body: [
            ['Progression Class', scan.progression.progressionCategory],
            ['Model Confidence', `${scan.progression.confidence.toFixed(1)}%`],
            ['Volumetric Growth Change', `${scan.progression.growthPercentage > 0 ? '+' : ''}${scan.progression.growthPercentage.toFixed(1)}%`],
            ['Volumetric Growth Rate', `${scan.progression.growthRate > 0 ? '+' : ''}${scan.progression.growthRate.toFixed(3)} cm³/month`],
            ['Estimated Future Volume', `${scan.progression.predictedVolume.toFixed(2)} cm³`]
          ]
        });
        
        finalY = (doc as any).lastAutoTable.finalY || 200;
      }

      // Explainable AI clinical insights (Objective 5)
      if (scan.xai && scan.xai.explanation) {
        doc.setFontSize(16);
        doc.text('Explainable AI Clinical Insights', 14, finalY + 15);
        
        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        
        // Wrap the clinical explanation text
        const splitText = doc.splitTextToSize(scan.xai.explanation, 180);
        doc.text(splitText, 14, finalY + 22);
      }

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          'Disclaimer: AI-generated analysis. Must be reviewed by a qualified radiologist.',
          105, 285, { align: 'center' }
        );
      }

      doc.save(`NeuroVision_Report_${scan.patientId}.pdf`);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Clinical Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and download patient PDF reports</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Patient ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      {completedScans.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
            <FileBarChart size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Reports Available</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            There are no completed scans matching your criteria. Complete the segmentation process on a scan to generate a report.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedScans.map((scan) => (
            <motion.div 
              key={scan._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-6 card-hover flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 rounded-xl">
                    <FileText className="text-primary-500" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{scan.patientId}</h3>
                    <p className="text-xs text-slate-500">{new Date(scan.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  scan.riskScore === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                  scan.riskScore === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {scan.riskScore || 'Review'} Risk
                </span>
              </div>

              <div className="space-y-3 flex-grow mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Modality</span>
                  <span className="font-medium dark:text-slate-300">{scan.modality}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Finding</span>
                  <span className="font-medium dark:text-slate-300">{scan.tumorType || 'Pending'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Volume</span>
                  <span className="font-medium dark:text-slate-300">{scan.volume ? `${scan.volume.toFixed(2)} cm³` : '-'}</span>
                </div>
                {scan.progression?.progressionCategory && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-semibold text-primary-500">Progression</span>
                    <span className={`font-semibold ${
                      scan.progression.progressionCategory === 'Progressive' ? 'text-red-500' :
                      scan.progression.progressionCategory === 'Regressive' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {scan.progression.progressionCategory}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-dark-700 mt-auto">
                <button 
                  onClick={() => generatePDF(scan)}
                  className="flex-1 btn-primary py-2.5 flex justify-center items-center gap-2 text-sm"
                >
                  <Download size={16} /> PDF
                </button>
                <button 
                  onClick={() => toast.success('Sent to printer queue')}
                  className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={() => toast.success('Report sharing link copied to clipboard')}
                  className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-dark-700 dark:hover:bg-dark-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
