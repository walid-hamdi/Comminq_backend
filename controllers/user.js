import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cryptoRandomString from "crypto-random-string";

import User from "../models/User.js";
import {
  deleteSchema,
  googleLoginSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  updateSchema,
  usersSchema,
} from "../validators/user.js";

function generateToken(email) {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign({ email }, jwtSecret);
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const { error } = registerSchema.validate(req.body);
    if (error) {
      // Return validation error message
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = generateToken(email);

    // Send the token in the response
    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const { error } = loginSchema.validate(req.body);
    if (error) {
      // Return validation error message
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ error: "There is no user with this email." });

    if (!bcrypt.compareSync(password, user.password))
      return res
        .status(404)
        .json({ error: "There is no user with this password." });

    // Generate JWT token
    const token = generateToken(email);

    // Send the token in the response
    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function profile(req, res) {
  try {
    // Get the user ID from the request
    const { id } = req.params;

    const { error } = profileSchema.validate(req.params);
    if (error) {
      // Return validation error message
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find the user in the database
    const user = await User.findById({ _id: id });

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
    if (error) {
      // Return validation error message
      return res.status(400).json({ error: error.details[0].message });
    }

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
    // Retrieve the user information from the params object
    const { id } = req.params;
    const { name, email } = req.body;

    const { error } = updateSchema.validate({ name, email });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find the user in the database
    const user = await User.findById({ _id: id });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the new email already exists in the database
    const existingUser = await User.findOne({ email: email });

    // If the new email belongs to another user, return an error
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Update the user's name and email
    user.name = name;
    user.email = email;

    // Save the updated user to the database
    await user.save();

    // Return the updated user profile
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
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find the user in the database
    const user = await User.findById({ _id: id });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
         picture,
      });

      user = await newUser.save();
    }

    const token = generateToken(email);

    return res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function generateRandomPassword(length = 10) {
  const password = cryptoRandomString({ length, type: "alphanumeric" });

  return password;
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
