const express = require("express");
const appRouter = express.Router();
const { User } = require("../../model/userSchema");
const validator = require("validator");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

appRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, bio, skills } = req.body;

    // Input Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First and last name are required." });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid or missing email address." });
    }

    if (!password || !validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password is not strong enough. Include uppercase, lowercase, numbers, and symbols.",
      });
    }

    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required." });
    }

    if (!bio) {
      return res.status(400).json({ success: false, message: "Bio is required." });
    }

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: "Skills must be an array." });
    }

    if (skills.length > 10) {
      return res.status(400).json({ success: false, message: "You can only add up to 10 skills." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      bio,
      skills,
    });

    await user.save();

    // Respond
    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Server error. " + error.message });
  }
});



appRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
    
        if (!email || !password) {
          return res.status(400).json({ message: "Email and password are required" });
        }
    
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
          return res.status(404).json({ message: "User not found. Please sign up first." });
        }
    
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
    
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
          expiresIn: "7d",
        });
    
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    
        res.status(200).json({
          message: "Login successful",
          user: {
            id: user._id,
            email: user.email,
          },
        });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in: " + error.message });
      }
});


appRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(0),
    });

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Error logging out" });
  }
});

module.exports = {
  appRouter,
};
