const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, errors: { label: 'key' } });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return res.status(400).json({ success: false, errors: errorDetails });
  }
  next();
};

module.exports = validate;
