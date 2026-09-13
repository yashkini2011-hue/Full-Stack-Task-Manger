export function notFound(req, res, next) {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server error',
  });
}