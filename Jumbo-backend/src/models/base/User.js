const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["superadmin", "admin", "employee", "manager"],
      required: true,
    },

  

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
    },
    gender: {
      type: String,
    },
    phoneNumber: {
      type: String,
      trim: true,
      required: true,
      match: [/^[0-9]{10}$/, "Phone number must be exactly 10 digits"],
    },
    address: {
      type: String,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
     organizationName: {
      type: String,
    },
    
    restaurantID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: function () {
        // Only required for admin and employee roles, not for superadmin
        return this.role === "admin" || this.role === "employee"
      },
    },
  },
  {
    timestamps: true,
    discriminatorKey: "role",
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
