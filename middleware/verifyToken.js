const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

module.exports = function verifyToken(req, res, next) {
  const token = req.headers["x-access-token"];
  jwt.verify(token, SECRET, (error) => {
    if (error) return res.status(401).end();
    next();
  });
};
