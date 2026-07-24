const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/stats', authorize('clinician', 'admin'), dashboardController.getStats);
router.get('/upcoming', authorize('clinician', 'admin'), dashboardController.getUpcoming);

module.exports = router;
