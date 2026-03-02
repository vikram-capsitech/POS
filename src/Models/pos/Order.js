import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    tableID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
      // null for delivery/takeaway orders
    },

    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          // snapshot of price at time of order
          // so menu price changes don't affect past orders
        },
        customization: { type: String, trim: true },
        specialRequest: { type: String, trim: true },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "preparing", "ready", "served", "paid", "cancelled"],
      default: "pending",
    },

    orderSource: {
      type: String,
      enum: ["dine-in", "takeaway", "zomato", "swiggy", "other"],
      default: "dine-in",
      // removed hardcoded delivery platforms — added "other" for flexibility
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      // total after discount
      // ideally computed: total - discount
    },

    waiterID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // replaced waiterName (String) with a proper ref
      // so you can track which staff handled which orders
    },

    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

orderSchema.index({ organizationID: 1, status: 1 });
orderSchema.index({ organizationID: 1, createdAt: -1 });
orderSchema.index({ tableID: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;