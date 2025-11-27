// Backend/models/userModel.js (verified - proper hashing)
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Not required - set in controller
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    file: {
      url: String,
      publicId: String,
      filename: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving (ONLY if password is modified)
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    console.log("Password not modified, skipping hash");
    return next();
  }

  try {
    console.log("Hashing password for user:", this.email);
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};

export default mongoose.model("User", userSchema);
