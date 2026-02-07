export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.errors,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'El registro ya existe (valor duplicado)',
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};
