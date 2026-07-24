const router = require('express').Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);

router.get('/', authorize('clinician', 'admin'), patientController.listPatients);
router.get('/:id', authorize('clinician', 'admin'), patientController.getPatient);

module.exports = router;
