// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity
module.exports = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;

  // A client error carries a message written for the caller. A server error
  // carries internal detail that was never meant to leave the process: the
  // password library's "Illegal arguments: object, string" confirmed to an
  // attacker that their injected operator had reached the comparison.
  const isClientError = status >= 400 && status < 500;
  const safeToSend = isClientError || process.env.NODE_ENV === 'development';

  res.status(status).json({
    message: safeToSend ? err.message : 'Internal server error',
  });
};
