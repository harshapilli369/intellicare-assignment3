const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { cache } = require('../middleware/cache');

router.use(authenticate);

router.get('/stats', authorize('clinician', 'admin'), cache(30), dashboardController.getStats);
router.get('/upcoming', authorize('clinician', 'admin'), cache(30), dashboardController.getUpcoming);

module.exports = router;
