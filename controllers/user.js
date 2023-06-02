import User from "../models/User.js";
import {
  deleteSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  updateSchema,
  usersSchema,
} from "../validators/user.js";

import {
  comparePassword,
  generateRandomPassword,
  generateToken,
  hashedPassword,
} from "../utils/user.js";
// Register endpoint
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

    // Create a new user
    const user = new User({
      name,
      email,
      password: await hashedPassword(password),
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    generateToken(res, email);

    // Return success response
    return res.json({ message: "User registered successfully" });
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
    return res.json({ message: "User logged in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function profile(req, res) {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
    const { name, email, picture, password } = req.body;

    const { error } = updateSchema.validate({ name, email });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingUser = await User.findOne({ email: email });

    if (existingUser && existingUser._id.toString() !== id)
      return res.status(400).json({ error: "Email already exists" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (picture) user.picture = picture;
    if (password) user.password = hashedPassword(password);

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
    const { email, name, picture } = req.body;

    // Validate the request body
    const { error } = googleLoginSchema.validate({ email, name, picture });
    if (error) return res.status(400).json({ error: error.details[0].message });

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = generateRandomPassword();

      const newUser = new User({
        name,
        email,
        password: hashedPassword(randomPassword),
        picture,
      });

      user = await newUser.save();
    }

    generateToken(email);

    return res.json({ message: "User logged in successfully" });
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
};
