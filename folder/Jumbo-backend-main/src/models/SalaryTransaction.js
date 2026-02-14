const mongoose = require("mongoose");
const salaryTransactionSchema = new mongoose.Schema({
  restaurantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    // required: [true, "Please add a restaurant"],
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  amount: Number,
  date: { type: Date, default: Date.now },
  currentMonth: {
    type: Number,
    default: () => new Date().getMonth(),
  },
  
  currentYear: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  type: { type: String, default: "salary" }, // credit
});

module.exports = mongoose.model("SalaryTransaction", salaryTransactionSchema);
