import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";

function generateToken(res, email) {
  const jwtSecret = process.env.JWT_SECRET;
  const token = jwt.sign({ email }, jwtSecret, {
    expiresIn: "1h",
    algorithm: "HS256",
  });

  res.cookie("comminq_auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}

async function hashedPassword(password) {
  return await bcrypt.hash(password, 10);
}

function generateRandomPassword(length = 10) {
  return cryptoRandomString({ length, type: "alphanumeric" });
}

function comparePassword(password, userPassword) {
  return bcrypt.compareSync(password, userPassword);
}

export {
  generateToken,
  hashedPassword,
  generateRandomPassword,
  comparePassword,
};
