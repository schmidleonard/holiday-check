module.exports = function (req, res, next) {
  if (req.user?.role !== 'admin') return res.sendStatus(403);
  next();
};
