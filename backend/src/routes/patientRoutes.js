const router = require('express').Router();
const patientController = require('../controllers/patientController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const { cache } = require('../middleware/cache');

router.use(authenticate);

router.get('/', authorize('clinician', 'admin'), cache(60), patientController.listPatients);
router.get('/:id', authorize('clinician', 'admin'), cache(60), patientController.getPatient);

module.exports = router;
