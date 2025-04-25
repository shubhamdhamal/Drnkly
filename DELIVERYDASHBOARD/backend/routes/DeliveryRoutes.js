const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { registerDeliveryPartner, loginDeliveryPartner } = require('../controllers/Deliverycontroller');
const { getDeliveryBoyProfile } = require('../controllers/Deliverycontroller');
const authenticate = require('../middleware/authenticate'); // You need this middleware
const { updateDeliveryBoyProfile } = require('../controllers/Deliverycontroller');


router.put('/profile', authenticate, updateDeliveryBoyProfile);


// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.post('/register', upload.fields([{ name: 'aadharCard' }, { name: 'drivingLicense' }]), registerDeliveryPartner);
router.post('/login', loginDeliveryPartner);
router.get('/profile', authenticate, getDeliveryBoyProfile);
router.put('/profile', authenticate, updateDeliveryBoyProfile);


module.exports = router;