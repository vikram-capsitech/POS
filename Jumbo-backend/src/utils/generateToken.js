const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const { exp, ...cleanPayload } = payload;
  return jwt.sign(cleanPayload, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

module.exports = { generateToken };
