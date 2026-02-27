const Document = require("../models/Document");
const Employee = require("../models/Employee");
const { decodeToken } = require("../utils/decodeToken");

// CREATE DOCUMENT

exports.createDocument = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      restaurantID = employee.restaurantID;
    } else {
      restaurantID = decodedId;
    }
    const { EmployeeId, docName, docType } = req.body;
    const file = req.file;
    const newDocument = await Document.create({
      restaurantID,
      EmployeeId,
      docName,
      docType,
      doc: file ? file.path : null,
      status: file ? "Received" : "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: newDocument,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET ALL DOCUMENTS

exports.getAllDocuments = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const documents = await Document.find({ restaurantID }).populate(
      "EmployeeId",
      "name position role",
    );
    //   .populate("restaurantId", "name");

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// GET DOCUMENTS BY EMPLOYEE

exports.getDocumentsByEmployee = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      restaurantID = employee.restaurantID;
    } else {
      restaurantID = decodedId;
    }
    const documents = await Document.find({
      EmployeeId: req.params.id,
      restaurantID,
    }).populate("EmployeeId", "name position role");

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE DOCUMENT

exports.updateDocument = async (req, res) => {
  try {
    const file = req.file;

    const updateData = {
      ...req.body,
    };

    if (file) {
      updateData.doc = file.path;
      updateData.status = "Received";
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedDoc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: updatedDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE DOCUMENT

exports.deleteDocument = async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
