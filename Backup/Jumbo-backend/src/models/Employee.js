const mongoose = require("mongoose");
const User = require("./base/User");

const employeeSchema = new mongoose.Schema({
  restaurantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  position: {
    type: String,
    trim: true,
  },

  hireDate: {
    type: Date,
    default: Date.now,
  },

  monthlyAdvanceTaken: {
    type: Number,
    default: 0,
  },
  monthlySalaryReceived: {
    type: Number,
    default: 0,
  },

  address: {
    type: String,
    trim: true,
  },
  salary: {
    type: Number,
    min: 0,
  },

  lastPaidAt: { type: Date, default: null }, // For "Last Paid"
  salaryStatus: {
    // For "Paid/Pending" badge
    type: String,
    enum: ["Paid", "Pending"],
    default: "Pending",
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },

  jobRole: {
    type: String,
    enum: ["kitchenStaff", "counterStaff", "serviceStaff", "others"],
    //  required: true,
  },
  access: {
    type: [String],
  },
  allotedItems: {
    type: [
      {
        name: String,
        isReceived: {
          type: String,
          default: "Pending",
        },
      },
    ],
  },
  leavesProvided: {
    type: Number,
  },
  CoinsPerMonth: {
    type: Number,
  },

  currentMonth: { type: Number, default: new Date().getMonth() },
  totalLeave: { type: Number, default: 4 },
  leaveTaken: { type: Number, default: 0 },
  fcmToken: {
    type: String,
    default: null,
  },
  unauthorizedLeaves: {
    type: Number,
    default: 0,
  },

  // lastAdvanceReset: {
  //   type: Date,
  //   default: Date.now,
  // },
});

// Create and export the Employee model
const Employee = User.discriminator("employee", employeeSchema);

module.exports = Employee;
