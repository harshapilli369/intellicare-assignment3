const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');

// Sign-in is the one unauthenticated endpoint that checks a secret, so it is
// where an attacker guesses passwords. The global limit is far too generous to
// stop that, and is lifted entirely when load testing.
// The load test signs in once per iteration, so the limit is lifted for that
// environment only. NODE_ENV=loadtest is never used in a deployment.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'loadtest' ? 100000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts, please try again later' },
});

// Both fields are asserted to be strings. Without this a JSON body can supply
// an object instead, and MongoDB reads the query operators inside it: an email
// of {"$ne": null} selects an account rather than matching an address.
const credentials = [
  body('email').isString().bail().trim().isEmail().normalizeEmail(),
  body('password').isString().bail().isLength({ min: 1, max: 200 }),
];

router.post(
  '/register',
  [...credentials, body('name').isString().trim().notEmpty(), body('role').optional().isString()],
  validate,
  authController.register
);

router.post('/login', loginLimiter, credentials, validate, authController.login);

module.exports = router;
