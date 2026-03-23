const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
    console.log("TOKEN:", token);
    console.log("DECODED USER:", decoded);
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Token is not valid" });
  }
};