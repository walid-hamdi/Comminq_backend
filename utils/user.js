import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";

function generateToken(res, email) {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = 60 * 60 * 1000; // Set the desired expiration time in milliseconds (1 hour in this example)

  const token = jwt.sign({ email }, jwtSecret, {
    expiresIn,
    algorithm: "HS256",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: expiresIn, // Set the expiration time for the cookie
  };

  res.cookie("comminq_auth_token", token, cookieOptions);
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

function clearAuthTokenCookie(res) {
  res.cookie("comminq_auth_token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
}

export {
  generateToken,
  hashedPassword,
  generateRandomPassword,
  comparePassword,
  clearAuthTokenCookie,
};
