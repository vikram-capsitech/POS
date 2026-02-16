const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a restaurant name"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    contactEmail: {
      type: String,
      required: [true, "Please add a contact email"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    theme: {
      primary: {
        type: String,
        default: "#5240d6",
      },
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    employees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    modules: {
      pos: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
