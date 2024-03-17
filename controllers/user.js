import User from "../models/User.js";
import cloudinary from "../storage/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

import {
  changePasswordByCodeSchema,
  changePasswordSchema,
  deleteSchema,
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  updateSchema,
  usersSchema,
} from "../validators/user.js";

import {
  clearAuthTokenCookie,
  comparePassword,
  generateRandomPassword,
  generateToken,
  hashedPassword,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/user.js";
import { google } from "googleapis";

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email is already registered" });

    const verificationToken = uuidv4();
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    const user = new User({
      name,
      email,
      password: await hashedPassword(password),
      verificationToken,
      verificationTokenExpiry,
    });

    await user.save();
    sendVerificationEmail(user.email, user.verificationToken);
    return res.json({ token: generateToken(res, email) });
  } catch (error) {
    console.error("Register error :", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!comparePassword(password, user.password))
      return res.status(401).json({ error: "Invalid password" });

    // if (!user.isVerified)
    //   sendVerificationEmail(user.email, user.verificationToken);

    const token = generateToken(res, email);
    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function profile(req, res) {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.isVerified)
      return res.status(401).json({
        error: "Email is not verified. Please verify your email.",
        email,
      });

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function users(req, res) {
  try {
    const { error } = usersSchema.validate(req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const users = await User.find();
    return res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    let { picture } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) updateFields.password = await hashedPassword(password);
    if (picture) {
      if (req.files && req.files.length) {
        const imgObj = await cloudinary.uploadPicture(picture, `${id}/user`);
        const imageSource = {
          url: imgObj.url.toString(),
          public_id: imgObj.public_id.toString(),
        };
        updateFields.picture = imageSource.url;
      } else {
        updateFields.picture = picture;
      }
    }
    const { error } = updateSchema.validate(updateFields);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== id)
      return res.status(400).json({ error: "Email already exists" });

    Object.assign(user, updateFields);
    await user.save();

    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteProfile(req, res) {
  try {
    const { id } = req.params;
    const { error } = deleteSchema.validate(req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById({ _id: id });

    if (!user) return res.status(404).json({ error: "User not found" });
    await user.deleteOne();
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function googleLogin(req, res) {
  try {
    const { access_token } = req.body;

    if (!access_token)
      return res.status(400).json({ error: "Access token is missing" });

    const googleOAuthClient = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    googleOAuthClient.setCredentials({ access_token });
    const { data } = await google
      .people({ version: "v1", auth: googleOAuthClient })
      .people.get({
        resourceName: "people/me",
        personFields: "emailAddresses,names,photos",
      });

    const { emailAddresses, names, photos } = data;
    const email = emailAddresses[0].value;
    const name = names[0].displayName;
    const picture = photos[0].url;

    const { error } = googleLoginSchema.validate({ email, name, picture });
    if (error) return res.status(400).json({ error: error.details[0].message });

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = generateRandomPassword();

      const newUser = new User({
        name,
        email,
        password: await hashedPassword(randomPassword),
        picture,
        isVerified: true,
      });
      console.log("newUser:", newUser);

      user = await newUser.save();
    }

    return res.json({ token: generateToken(res, email) });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

function logout(req, res) {
  clearAuthTokenCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
}

async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isVerified = true;

    await user.save();
    return res.json({ message: "Email verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a new verification token and token expiry date
    const verificationToken = uuidv4();
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Update the user's verification token and token expiry date
    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;

    // Save the user with the updated fields
    await user.save();

    // Send the verification email with the new token
    sendVerificationEmail(user.email, user.verificationToken);

    // Return a response indicating successful resend
    return res.json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    // Validate request body
    const { error } = forgotPasswordSchema.validate({ email });
    if (error) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Find the user in the database based on the email
    const user = await User.findOne({ email });

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a verification code and code expiry date
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationCodeExpiry = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

    // Update the user's verification code and code expiry date
    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;

    // Save the user with the updated fields
    await user.save();

    // Send the password reset email with the verification code
    sendPasswordResetEmail(user.email, verificationCode);

    // Return a response indicating successful password reset request
    return res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;

    // Find the user based on the email
    const user = await User.findOne({ email });

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the verification code matches and is still valid
    if (
      user.verificationCode === code &&
      user.verificationCodeExpiry > Date.now()
    ) {
      // Return a response indicating successful code verification
      return res.json({ message: "Code verified successfully" });
    } else {
      // Handle case where the code is incorrect or expired
      return res.status(400).json({ error: "Invalid verification code" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function changePasswordByCode(req, res) {
  try {
    const { code, newPassword } = req.body;

    const { error } = changePasswordByCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find the user with the given verification code
    const user = await User.findOne({ verificationCode: code });
    if (!user) {
      return res.status(404).json({ error: "Invalid verification code" });
    }

    // Set the new password for the user
    user.password = await hashedPassword(newPassword);
    user.verificationCode = ""; // Clear the verification code
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function changePassword(req, res) {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Find the user in the database
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Compare the current password with the stored password
    if (!comparePassword(currentPassword, user.password))
      return res.status(401).json({ error: "Invalid current password" });

    // Update the user's password with the new password
    user.password = await hashedPassword(newPassword);
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default {
  register,
  login,
  googleLogin,
  profile,
  users,
  updateProfile,
  deleteProfile,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  verifyCode,
  changePasswordByCode,
  changePassword,
};
