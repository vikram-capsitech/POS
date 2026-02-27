const express = require("express");
const {
  createRequest,
  getRequestbyFilter,
  getAllRequests,
  getAllRequestsforEmployees,
  getRequestById,
  updateRequest,
  deleteRequest,
  markRequestSeen,
} = require("../controllers/requestController");
const { upload } = require("../config/cloudinary");
const { protect } = require('../middleware/authMiddleware.js');

const requestRouter = express.Router();

requestRouter.post("/",protect,upload.single('voiceNote'), createRequest);
requestRouter.post('/filter',protect,getRequestbyFilter);  
requestRouter.get("/", protect,getAllRequests);
requestRouter.get('/emp',protect,getAllRequestsforEmployees);
requestRouter.get("/:id", getRequestById);
requestRouter.put("/:id",upload.single('voiceNote'), updateRequest);
requestRouter.patch("/requestSeen",protect,markRequestSeen);
requestRouter.delete("/:id", deleteRequest);


module.exports = requestRouter;
 