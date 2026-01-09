import express from "express";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fetchuser from "../middleware/fetchuser.js";

// Initialize dotenv to use environment variables

const router = express.Router();

// Create user route
router.post(
  "/createuser",
  [
    body("name", "Name should be at least 3 characters long").isLength({ min: 3 }),
    body("password", "Password should be at least 5 characters long").isLength({ min: 5 }),
    body("email", "Invalid email").isEmail(),
  ],
  async (req, res) => {
    let success=false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }


    try {
      // Check if user already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success=false;
        return res.status(400).json({success, error: "Email already exists" });
      }

      // Generate salt and hashed password
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      // Generate JWT token
      const data = {
        user: {
          id: user.id,
        },
      };
      const JWT_SECRET = "vaibhav"; 
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authToken });
    } catch (error) {
      success=false;
      console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a response in case of error
    }
  }
);
// User login route
router.post(
  "/login",
  [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success=false;
      return res.status(400).json({ success,errors: errors.array() });
    }
    let success=false;


    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false;
        return res.status(400).json({success, error: "Invalid email or password" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success=false;
        return res.status(400).json({success, error: "Invalid email or password" });
      }

      // Generate JWT token
      const data = {
        user: {
          id: user.id,
        },
      };
      const JWT_SECRET = "vaibhav"; // Use env variable or fallback
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success,authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a response in case of error
    }
  }
);

//route 3: user details
router.post(
  "/getuser",fetchuser,
  async (req, res) => {
try {
  const userId=req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user);
} catch (error) {
  console.error(error.message);
      res.status(500).send("Internal Server Error"); // Send a response in case of error
  
}
  })

export default router;