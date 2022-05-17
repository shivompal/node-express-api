module.exports = function(req, res, next) {
  // Unauthorised 401
  // Forbidden 403

  if (!req.user.isAdmin) return res.status(403).send("Access denied...");

  next();
};
