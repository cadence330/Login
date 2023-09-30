// Login Authentication
function isAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized');
  }
  next();
}

module.exports = { isAuthenticated } ;