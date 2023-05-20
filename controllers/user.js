import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";

function generateToken(email) {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign({ email }, jwtSecret);
}

async function register(req, res) {
  try {
    // Check for validation errors
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    // Extract user registration data from request body
    const { name, email, password } = req.body;

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

    // const { error } = authorValidations.signinSchema.validate({
    //   email,
    //   password,
    // });

    // if (error) {
    //   return res.status(400).send(error.details[0].message);
    // }

    const author = await User.findOne({ email });
    if (!author)
      return res
        .status(404)
        .json({ error: "There is no user with this email." });

    if (!bcrypt.compareSync(password, author.password))
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

    // Find the user in the database
    const user = await User.findById({ _id: id });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
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

export default {
  register,
  login,
  profile,
  users,
  updateProfile,
  deleteProfile,
};
