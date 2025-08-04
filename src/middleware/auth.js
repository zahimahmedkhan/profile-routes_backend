const jwt = require("jsonwebtoken");
const {User} = require("../model/userSchema")

const userAuth = async (req, res, next) => {
    try {
      const token = req.cookies.token;
  
      if (!token) {
        return res.status(401).json({ success: false, message: "Authentication token not found" });
      }
  
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
      const user = await User.findById(decoded.id).select("-password"); // exclude password for safety
  
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      req.user = user;
      next();
  
    } catch (err) {
      console.error("Auth middleware error:", err);
      res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  };
  

module.exports = {

    userAuth,
};