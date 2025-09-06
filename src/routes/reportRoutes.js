const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const { generateReport, downloadReport } = require('../controllers/reportController');
const router = express.Router();


router.get('/generate', authenticateToken, generateReport);

router.get('/download', authenticateToken, downloadReport);

module.exports = router;