const express = require('express');
const { User } = require('../../model/userSchema');
const { userAuth } = require('../../middleware/auth');
const profileRouter = express.Router()
const jwt = require('jsonwebtoken')


profileRouter.get('/userProfile', userAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills
    });
  } catch (error) {
    console.error("User profile fetch error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
});


profileRouter.patch("/updateUserProfile", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, role, bio } = req.body;

    if (!firstName || !lastName || !role || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // userAuth already attaches `req.user`
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, role, bio },
      { new: true, select: "-password" } // exclude password from returned doc
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        skills: updatedUser.skills
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});



module.exports = {
    profileRouter
}
