const express = require('express');
const router = express.Router();
const { 
  getScans, 
  getScan, 
  createScan, 
  preprocessScan, 
  segmentScan, 
  reconstructScan,
  predictProgression,
  explainScan,
  getSliceImage,
  importKaggle,
  importHuggingFace,
  importTCIA,
  importBraTS,
  importURL,
  deleteScan 
} = require('../controllers/scanController');
const { authenticateToken } = require('../middleware/auth');

// Public image stream route for browser <img> tags
router.get('/public-slices/:id/:sliceIdx', getSliceImage);

router.use(authenticateToken);

router.post('/import/kaggle', importKaggle);
router.post('/import/huggingface', importHuggingFace);
router.post('/import/tcia', importTCIA);
router.post('/import/brats', importBraTS);
router.post('/import/url', importURL);

router.get('/:id/slices/:sliceIdx', getSliceImage);

router.route('/')
  .get(getScans)
  .post(createScan);

router.route('/:id')
  .get(getScan)
  .delete(deleteScan);

router.post('/:id/preprocess', preprocessScan);
router.post('/:id/segment', segmentScan);
router.post('/:id/reconstruct', reconstructScan);
router.post('/:id/progression', predictProgression);
router.post('/:id/explain', explainScan);

module.exports = router;
