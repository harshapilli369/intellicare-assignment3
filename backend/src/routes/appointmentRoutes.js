const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { cache } = require('../middleware/cache');

router.use(authenticate);

router.get('/', authorize('clinician', 'admin'), cache(30), appointmentController.listAppointments);

module.exports = router;
