const express = require("express");
const appRouter = express.Router();
const { User } = require("../../model/userSchema");
const validator = require("validator");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

appRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, bio, skills } =
      req.body;

    if (!firstName || !lastName) {
      throw new Error("name not found");
    } else if (!validator.isEmail(email)) {
      throw new Error("invalid Email");
    } else if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ success: false, message: "Email already exists" });
    } else if (!validator.isStrongPassword(password)) {
      throw new Error("Please type a strong password");
    } else if (!role) {
      throw new Error("role not found");
    } else if (!bio) {
      throw new Error("bio not found");
    } else if (!skills) {
      throw new Error("skills is required");
    } else if (skills.length > 10) {
      throw new Error("You can only add up to 10 skills");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      bio,
      skills,
    });

   await user.save();

    const token = await jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        bio: user.bio,
        skills: user.skills,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


appRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists by email only
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up first." });
    }

    // Compare plain password with hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None", // Needed for cross-site cookie if using frontend on a different domain
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Respond with success and user info
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
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
