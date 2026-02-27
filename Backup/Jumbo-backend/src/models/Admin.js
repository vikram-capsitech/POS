const mongoose = require("mongoose");
const User = require("./base/User");

const AdminSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Please add a restaurant"],
    },
    currentLocation: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    monthlyfee: {
      type: String,
      trim: true,
      //  required: true,
    },
  },
  { discriminatorKey: "role" },
);

const Admin = User.discriminator("admin", AdminSchema);

module.exports = Admin;
