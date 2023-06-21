import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";
import nodemailer from "nodemailer";

function generateToken(res, email, isVerified) {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = 60 * 60 * 1000; // Set the desired expiration time in milliseconds (1 hour in this example)

  const token = jwt.sign({ email, isVerified }, jwtSecret, {
    expiresIn,
    algorithm: "HS256",
  });

  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  //   sameSite: "strict", // Prevent CSRF attacks
  //   maxAge: expiresIn, // Set the expiration time for the cookie
  // };

  // const cookieOptions = {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  //   sameSite: "strict", // Prevent CSRF attacks
  //   maxAge: expiresIn, // Set the expiration time for the cookie
  //   domain: "comminq-frontend.vercel.app", // Set the cookie domain
  // };

  // res.cookie("comminq_auth_token", token, cookieOptions);
  return res.json({ token });
}

async function hashedPassword(password) {
  return await bcrypt.hash(password, 10);
}

function generateRandomPassword(length = 10) {
  return cryptoRandomString({ length, type: "alphanumeric" }).toString();
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

function nodeMailerConfig() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
    port: 465, // Port for SMTP (usually 465)
    secure: true, // Usually true if connecting to port 465
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

// send email for verification
function sendVerificationEmail(email, verificationToken) {
  const transporter = nodeMailerConfig();
  const domain_host = process.env.BACKEND_HOST;

  const mailOptions = {
    from: `"Comminq App" <${process.env.EMAIL}>`,
    to: email,
    subject: "Email Verification",
    html: `
      <p>Please click the following link to verify your email:</p>
      <a href="${domain_host}/api/user/verify-email/${verificationToken}">Verify Email</a>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending verification email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
}

function sendPasswordResetEmail(email, verificationCode) {
  const transporter = nodeMailerConfig();
  const mailOptions = {
    from: `"Comminq App" <${process.env.EMAIL}>`,
    to: email,
    subject: "Password Reset",
    text: `Your verification code: ${verificationCode}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending reset password verification:", error);
    } else {
      console.log("Password Reset Verification sent:", info.response);
    }
  });
}

export {
  generateToken,
  hashedPassword,
  generateRandomPassword,
  comparePassword,
  clearAuthTokenCookie,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
