const asyncHandler = require("express-async-handler");
const InventoryRequest = require("../models/InventoryRequest");

// @desc    Create a new inventory request
// @route   POST /api/inventory/request
// @access  Private (Kitchen/Admin)
const createRequest = asyncHandler(async (req, res) => {
  const { item, quantity, urgency, message, restaurantId } = req.body;

  const request = await InventoryRequest.create({
    restaurantId: restaurantId || req.user.restaurantId,
    requestedBy: req.user._id,
    item,
    quantity,
    urgency,
    message,
  });

  res.status(201).json(request);
});

// @desc    Get all requests for a restaurant
// @route   GET /api/inventory
// @access  Private (Admin)
const getRequests = asyncHandler(async (req, res) => {
  const restaurantId = req.query.restaurantId || req.user.restaurantId;

  // if (!restaurantId) {
  //     res.status(400);
  //     throw new Error('Restaurant ID required');
  // }

  const requests = await InventoryRequest.find()
    .populate("requestedBy", "name role")
    .sort({ createdAt: -1 });

  res.json(requests);
});

// @desc    Update request status
// @route   PUT /api/inventory/:id
// @access  Private (Admin)
const updateRequest = asyncHandler(async (req, res) => {
  const request = await InventoryRequest.findById(req.params.id);

  if (request) {
    request.status = req.body.status || request.status;
    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } else {
    res.status(404);
    throw new Error("Request not found");
  }
});

module.exports = {
  createRequest,
  getRequests,
  updateRequest,
};
