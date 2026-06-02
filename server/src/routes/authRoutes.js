const router = require('express').Router();
const protect = require('../middleware/auth');
const c = require('../controllers/authController');
const adminSeed = require('../controllers/adminSeedController');

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/forgot-password', c.forgotPassword);
router.put('/reset-password/:token', c.resetPassword);
router.post('/make-admin', adminSeed.makeAdmin);
router.get('/me', protect, c.me);
router.put('/profile', protect, c.updateProfile);
router.put('/change-password', protect, c.changePassword);

module.exports = router;
