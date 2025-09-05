const express = require('express');
const { forgotPassword, resetPasswordForm, updatePassword } = require('../controllers/forgotPasswordController');
const router = express.Router();

router.post('/forgotpassword', forgotPassword);
router.get('/resetpassword/:uuid', resetPasswordForm);
router.post('/updatepassword/:uuid', updatePassword);

module.exports = router;