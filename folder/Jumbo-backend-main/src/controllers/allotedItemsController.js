const AllocatedItems = require("../models/AllocatedItems");
const Employee = require("../models/Employee");
const { decodeToken } = require("../utils/decodeToken");

// CREATE ITEM 
exports.createAllocatedItem = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const data = req.body;
    data.restaurantID = restaurantID;

    if (req.file) {
      data.image = req.file.path;
    }

    const item = await AllocatedItems.create(data);

    res.status(201).json({
      success: true,
      message: "Allocated item created successfully",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET ALL ITEMS
exports.getAllAllocatedItems = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const items = await AllocatedItems.find({ restaurantID })
      //   .populate("restaurantId")
      .populate("employeeId")
      .populate("issuedTo");

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET BY ID
exports.getAllocatedItemById = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const item = await AllocatedItems.findOne({ _id: req.params.id, restaurantID })
      //   .populate("restaurantId")
      .populate("employeeId")
      .populate("issuedTo");

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE ITEM 
exports.updateAllocatedItem = async (req, res) => {
  try {
    const data = req.body;

    if (req.file) {
      data.image = req.file.path;
    }

    const item = await AllocatedItems.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    res.status(200).json({
      success: true,
      message: "Allocated item updated",
      data: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE
exports.deleteAllocatedItem = async (req, res) => {
  try {
    const item = await AllocatedItems.findByIdAndDelete(req.params.id);

    if (!item)
      return res.status(404).json({ success: false, message: "Item not found" });

    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET ITEMS BY EMPLOYEE ID
exports.getItemsByEmployeeId = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const items = await AllocatedItems.find({ issuedTo: req.params.employeeId, restaurantID })
      //   .populate("restaurantId")
      .populate("employeeId", "name")
      .populate("issuedTo", "name");

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
