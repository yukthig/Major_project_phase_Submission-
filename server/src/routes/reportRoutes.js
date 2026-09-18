const express = require('express');
const router = express.Router();
const { getReports, createReport, deleteReport } = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.route('/')
  .get(getReports)
  .post(createReport);

router.route('/:id')
  .delete(deleteReport);

module.exports = router;
