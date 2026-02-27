const mongoose = require("mongoose");
const salaryRecordSchema = new mongoose.Schema({
    restaurantID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: [true, "Please add a restaurant"],
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "employee",
        // required: true,
    },


    date: {
        type: Date,
        default: Date.now
    },

    currentMonth: {
        type: Number,
        default: () => new Date().getMonth(),
    },
    currentYear: {
        type: Number,
        default: () => new Date().getFullYear(),
    },
    //   type:
    //    { type: String, 
    //     default: "salary" }, // credit

    status:
    {
        type: String,
        enum: ["Paid", "Pending"],
    },
},

    {
        timestamps: true,
    }
);

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);
