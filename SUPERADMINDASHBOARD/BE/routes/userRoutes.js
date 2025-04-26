const express = require('express');
const router = express.Router();
const { getAllCustomers, acceptVerification, rejectVerification } = require('../controllers/userController');

// Route to get all customers
router.get('/customers', getAllCustomers);

// Route to accept verification
router.put('/customers/accept/:userId', acceptVerification);

// Route to reject verification
router.put('/customers/reject/:userId', rejectVerification);

module.exports = router;
