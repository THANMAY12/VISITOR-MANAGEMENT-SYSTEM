const Visitor = require('../models/visitor');

// Create visitor
exports.createVisitor = async (req, res) => {
  try {
    const { name, email, phone, photo, company } = req.body;
    const visitor = await Visitor.create({ name, email, phone, photo, company });
    res.status(201).json({ message: "Visitor created", visitor: visitor });
  } catch (err) {
    console.error("createVisitor error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all visitors
exports.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.status(200).json(visitors);
  } catch (err) {
    console.error("getVisitors error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Public visitor self-registration
exports.createVisitorPublic = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;
    const visitor = await Visitor.create({
      name,
      email,
      phone,
      company,
      createdBy: null,
      status: "pending"
    });
    res.status(201).json({ message: "Visitor registered", visitor: visitor });
  } catch (err) {
    console.error("createVisitorPublic error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.approveVisitor = async (req, res) => {
  try {
    const { id } = req.params;

    const visitor = await Visitor.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({ error: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor approved successfully", visitor: visitor });
  } catch (err) {
    console.error("approveVisitor error:", err);
    res.status(500).json({ error: err.message });
  }
};
