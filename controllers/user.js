import User from "../models/User.js";
import cloudinary from "../storage/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

import {
  deleteSchema,
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
  sendVerificationEmail,
} from "../utils/user.js";
import { google } from "googleapis";

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email is already registered" });

    // Generate a verification token and token expiry date
    const verificationToken = uuidv4();
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create a new user
    const user = new User({
      name,
      email,
      password: await hashedPassword(password),
      verificationToken,
      verificationTokenExpiry,
    });

    // Save the user to the database
    await user.save();

    // Send verification email
    sendVerificationEmail(user.email, user.verificationToken);

    // Generate JWT token
    generateToken(res, email);

    // Return success response
    // return res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Login endpoint
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!comparePassword(password, user.password))
      return res.status(401).json({ error: "Invalid password" });

    // Set the token as an HTTP-only cookie
    generateToken(res, email);

    // Return success response
    // return res.json({ message: "User logged in successfully" });
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

    // Return the user profile
    return res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function users(req, res) {
  try {
    const { error } = usersSchema.validate(req.params);
    if (error)
      // Return validation error message
      return res.status(400).json({ error: error.details[0].message });

    // Retrieve all users from the database
    const users = await User.find();

    // Return the list of users
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
    if (password) updateFields.password = hashedPassword(password);
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
    // Retrieve the user information from the params object
    const { id } = req.params;

    // Validate the delete request
    const { error } = deleteSchema.validate(req.params);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Find the user in the database
    const user = await User.findById({ _id: id });

    // Check if the user exists
    if (!user) return res.status(404).json({ error: "User not found" });

    // Delete the user
    await user.deleteOne();

    // Return success message
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

    // Set the access token for the OAuth client
    googleOAuthClient.setCredentials({ access_token });

    // Make a request to the Google API to get the user information
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

    generateToken(res, email);

    // return res.json({ message: "User logged in successfully" });
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

    // Find the user in the database based on the verification token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).json({ error: "User not found" });
    }

    // Update the isVerified field to true
    user.isVerified = true;

    // Optionally, perform additional checks or validations as per your requirements

    // Save the user with the updated field
    await user.save();

    // Return a response indicating successful verification
    return res.json({ message: "Email verification successful" });
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
};
