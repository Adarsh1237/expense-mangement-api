module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Email already exists"
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", ")
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    return res.status(500).json({
      success: false,
      message: "Database error"
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
};