const express = require('express');
const router = express.Router();
const { 
  getStats, 
  getAllUsers, 
  deleteUser,
  getAllScans, 
  deleteScan, 
  getSystemHealth 
} = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/scans', getAllScans);
router.get('/health', getSystemHealth);
router.delete('/scans/:id', deleteScan);

module.exports = router;
