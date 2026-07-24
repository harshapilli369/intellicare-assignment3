const router = require('express').Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', authorize('clinician', 'admin'), appointmentController.listAppointments);

module.exports = router;
