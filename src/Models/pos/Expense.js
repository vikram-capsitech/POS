import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "food",
        "utilities",
        "staff",
        "maintenance",
        "marketing",
        "rent",
        "other",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "bank_transfer", "other"],
      default: "cash",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    vendor: {
      type: String,
      trim: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

expenseSchema.index({ organizationID: 1, date: -1 });
expenseSchema.index({ organizationID: 1, category: 1 });

const Expense = mongoose.model("PosExpense", expenseSchema);
export default Expense;
