const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Visitor = require('../models/visitor')

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    // Check if the email is already registered in the DB
    const found = await User.findOne({ email: email });
    if (found) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // encrypt passwrod
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name,
      email: email,
      password: hashPass,
      role: role
    });

    // sign the jwt token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "2d" }
    );

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: token
    })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "server error" })
  }
}


exports.registerVisitor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate
    if (!name || !email || !password) {
      return res.status(400).json({ error: "all fields needed" });
    }

    const exists = await User.findOne({ email })
    if (exists) {
      return res.status(400).json({ error: "email taken" })
    }

    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "visitor"
    })

    
    const already = await Visitor.findOne({ email })
    if (!already) {
      await Visitor.create({
        name: name,
        email: email,
        phone: "N/A",
        status: "pending"
      })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "2d" })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "registration failed" })
  }
}


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //creat login token expiry 2 days
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "2d" }
    );

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    })

  } catch (e) {
    console.log(e)
    res.status(500).json({ error: "login failed" })
  }
}

exports.logoutUser = (req, res) => {
  res.json({ message: "logged out" })
}