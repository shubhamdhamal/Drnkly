const express = require('express');
const router = express.Router();
const { getAllCustomers, acceptVerification, rejectVerification,getCustomerById } = require('../controllers/userController');
const verifySuperAdminToken = require('../middleware/authMiddleware'); // ✅ Make sure path is correct

router.get('/customers', verifySuperAdminToken, getAllCustomers);
router.put('/customers/accept/:userId', verifySuperAdminToken, acceptVerification);
router.put('/customers/reject/:userId', verifySuperAdminToken, rejectVerification);
router.get('/customers/:id', verifySuperAdminToken, getCustomerById);

module.exports = router;
