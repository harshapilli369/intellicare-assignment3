const { validationResult } = require('express-validator');

// Stops a request whose body failed validation before it reaches a controller.
// The response names the offending fields but not the values, so it cannot be
// used to confirm whether an account exists.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    message: 'Invalid request',
    fields: [...new Set(result.array().map((error) => error.path))],
  });
};
