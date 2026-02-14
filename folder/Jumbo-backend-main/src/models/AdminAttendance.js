const mongoose = require("mongoose");

const AdminAttendanceSchema = new mongoose.Schema(
  {
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      //  required: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
       required: true,
      ref: "admin",
    },

    // employee: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   //  required: true,
    //   ref: "employee",
    // },

    //  userType:{
    //   type: String,
    //   required: true,
    //   enum:["admin","employee"],
    //  },  


    date: {
      type: Date,
      required: true,
    },

    checkIn: {
      type: Date,
      default: null,
    },

    checkOut: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("adminAttendance", AdminAttendanceSchema);
