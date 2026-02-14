const SOP = require("../models/Sop");
const { decodeToken } = require("../utils/decodeToken");
const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notificationService");
const Employee = require("../models/Employee");

//  Create SOP
exports.createSOP = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      difficultyLevel,
      estimatedTime,
      owner,
      status,
    } = req.body;

    let restaurantID = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    }
    // else it's already restaurantID (admin request)

    const voiceNoteurl = req.file
      ? req.file.path || req.file.url || req.file.secure_url
      : null;

    let steps = req.body.steps;
    if (typeof steps === "string") {
      try {
        steps = JSON.parse(steps);
      } catch (err) {
        console.error("❌ Invalid JSON in steps:", steps);
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for steps field",
        });
      }
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }

    const sop = await SOP.create({
      title,
      description,
      category,
      difficultyLevel,
      estimatedTime,
      voiceNote: voiceNoteurl,
      steps,
      owner,
      status,
      restaurantID,
    });

    // Send notification to all employees in the restaurant about new SOP
    const employees = await Employee.find({ restaurantID, status: "active" });
    if (employees.length > 0) {
      const employeeIds = employees.map((emp) => emp._id);
      await sendBulkNotification(
        employeeIds,
        "info",
        "sop",
        "New SOP Created",
        `A new SOP has been created: ${title} `,
        { sopId: sop._id.toString(), category }
      );
    }

    res.status(201).json({
      success: true,
      message: "SOP created successfully",
      data: sop,
    });
  } catch (error) {
    console.error("Error creating SOP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.getSOPbyFilter = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }

    const { difficultyLevel, category } = req.body;
    const { page = 1, limit = 2 } = req.query;
    const query = { restaurantID, status: "Active" };

    const orConditions = [];

    // if (category && category.length) {
    //   orConditions.push({ category: { $in: category } });
    // }

    if (difficultyLevel && difficultyLevel.length) {
      orConditions.push({ difficultyLevel: { $in: difficultyLevel } });
      //  query.$or = difficultyLevel.map(level => ({ difficultyLevel: level }));
    }

    // if (owner && owner.length) {
    //   orConditions.push({ owner: { $in: owner } });
    // }

    // let SOPs;

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }
    // Matches any of the selected filters

    // const total = await SOP.countDocuments(query);

    // } else {
    //   // No filters selected, return all tasks
    //   SOPs = await SOP.find(query).populate("owner").sort({ createdAt: -1 })
    //    .skip((page-1)*limit).limit(Number(limit));

    // }
    if (category) {
      query.category = category;
    }
    const total = await SOP.countDocuments(query);
    const SOPs = await SOP.find(query)
      .populate("owner")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).json({
      success: true,
      count: total,
      data: SOPs,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//  Get All SOPs (optionally filter by owner)
exports.getAllSOPs = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let userId;
    if (employee) {
      // It was an employee ID (app request)
      userId = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      userId = decodedId;
    }
    const { page = 1, limit = 2 ,category,status} = req.query;
    const query = { restaurantID: userId };
     if (category) {
      query.category = category;
    }
     if (status) {
      query.status = status;
    }
    const sops = await SOP.find(query)
      .populate("owner")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await SOP.countDocuments(query);
    res.status(200).json({
      success: true,
      count: total,
      data: sops,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching SOPs:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//  Get SOP by ID
exports.getSOPById = async (req, res) => {
  try {
    const sop = await SOP.findById(req.params.id).populate("owner");
    // if (!sop) return res.status(404).json({ success: false, message: 'SOP not found' });

    res.status(200).json({ success: true, data: sop });
  } catch (error) {
    console.error("Error fetching SOP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

exports.updateSOP = async (req, res) => {
  try {
    const sopId = req.params.id;
    const sop = await SOP.findById(sopId);
    if (!sop) {
      return res.status(404).json({ success: false, message: "SOP not found" });
    }

    // Parse steps if sent as string
    let { steps, ...otherFields } = req.body;
    if (typeof steps === "string") {
      try {
        steps = JSON.parse(steps);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid JSON format for steps",
        });
      }
    }

    // Handle voice note file (optional)
    const voiceNoteUrl = req.file
      ? req.file.path || req.file.url || req.file.secure_url
      : sop.voiceNote; // Keep old one if not replaced

    // Update SOP
    const updatedData = {
      ...otherFields,
      steps,
      voiceNote: voiceNoteUrl,
    };

    const updatedSOP = await SOP.findByIdAndUpdate(sopId, updatedData, {
      new: true,
      runValidators: true,
    });

    // Send notification to all employees about SOP update
    const employees = await Employee.find({
      restaurantID: sop.restaurantID,
      status: "active",
    });
    if (employees.length > 0) {
      const employeeIds = employees.map((emp) => emp._id);
      await sendBulkNotification(
        employeeIds,
        "info",
        "sop",
        "SOP Updated",
        `SOP "${updatedSOP.title}" has been updated`,
        { sopId: updatedSOP._id.toString(), category: updatedSOP.category }
      );
    }

    res.status(200).json({
      success: true,
      message: "SOP updated successfully",
      data: updatedSOP,
    });
  } catch (error) {
    console.error("Error updating SOP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

//  Delete SOP (only by owner)
exports.deleteSOP = async (req, res) => {
  try {
    const sop = await SOP.findById(req.params.id);
    if (!sop)
      return res.status(404).json({ success: false, message: "SOP not found" });

    await sop.deleteOne();

    res.status(200).json({
      success: true,
      message: "SOP deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SOP:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
