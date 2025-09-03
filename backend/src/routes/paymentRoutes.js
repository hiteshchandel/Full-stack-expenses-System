const express = require('express');
const { authenticateToken } = require('../utils/jwt');
const { createPayment, updatePaymentStatus } = require('../controllers/paymentController');
const router = express.Router();

router.post('/create', authenticateToken, createPayment);

router.get('/status/:orderId', authenticateToken, updatePaymentStatus);


module.exports = router;
