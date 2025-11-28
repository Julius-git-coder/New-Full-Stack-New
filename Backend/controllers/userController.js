// Backend/controllers/userController.js (Updated with proxy download)
import UserModel from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";
import https from "https";
import http from "http";

// Get all users (only owner's managed users, exclude self)
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({
      ownerId: req.user._id,
      _id: { $ne: req.user._id },
    })
      .sort({ createdAt: -1 })
      .select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details: error.message,
    });
  }
};

// Get single user by ID (only if owned by req.user, allow self if needed)
export const getUserById = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch user",
      details: error.message,
    });
  }
};

// Create new user (set ownerId to req.user._id - managed user)
export const createUser = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const newUser = {
      name,
      email,
      password, // Will be hashed by pre-save hook
      phone: phone || "",
      address: address || "",
      ownerId: req.user._id,
    };

    // If file is uploaded, upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "users",
              resource_type: "auto",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          uploadStream.end(req.file.buffer);
        });

        newUser.file = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          filename: req.file.originalname,
        };

        console.log("File uploaded to Cloudinary:", uploadResult.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(400).json({
          error: "Failed to upload file to Cloudinary",
          details: uploadError.message,
        });
      }
    }

    const user = await UserModel.create(newUser);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        hasFile: !!user.file,
        fileUrl: user.file?.url,
        filename: user.file?.filename,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
};

// Update user (only if owned by req.user)
export const updateUser = async (req, res) => {
  try {
    console.log("Update user request:", {
      userId: req.params.id,
      body: {
        ...req.body,
        password: req.body.password ? "[REDACTED]" : undefined,
      },
      hasFile: !!req.file,
    });

    const { name, email, phone, address, password } = req.body;
    const user = await UserModel.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
    }

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Update password if provided (pre-save hook will hash it)
    if (password && password.trim() !== "") {
      user.password = password;
    }

    // If new file is uploaded
    if (req.file) {
      console.log("New file being uploaded:", req.file.originalname);

      // Delete old file from Cloudinary if exists
      if (user.file && user.file.publicId) {
        try {
          await cloudinary.uploader.destroy(user.file.publicId);
          console.log("Old file deleted from Cloudinary:", user.file.publicId);
        } catch (error) {
          console.error("Error deleting old file:", error);
          // Continue even if deletion fails
        }
      }

      // Upload new file
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "users",
              resource_type: "auto",
              use_filename: true,
              unique_filename: true,
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(req.file.buffer);
        });

        user.file = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          filename: req.file.originalname,
        };

        console.log(
          "New file uploaded to Cloudinary:",
          uploadResult.secure_url
        );
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        return res.status(400).json({
          error: "Failed to upload new file",
          details: uploadError.message,
        });
      }
    }

    await user.save();
    console.log("User updated successfully:", user._id);

    res.status(200).json({
      message: "User updated successfully",
      user: user.toObject({
        versionKey: false,
        transform: (doc, ret) => {
          delete ret.password;
          return ret;
        },
      }),
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: "Failed to update user",
      details: error.message,
    });
  }
};

// Delete user (only if owned by req.user)
export const deleteUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete file from Cloudinary if exists
    if (user.file && user.file.publicId) {
      try {
        await cloudinary.uploader.destroy(user.file.publicId);
        console.log("File deleted from Cloudinary:", user.file.publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with user deletion even if file deletion fails
      }
    }

    await UserModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User and associated file deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Failed to delete user",
      details: error.message,
    });
  }
};

// Download/view user's file - PROXY VERSION
export const downloadFile = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.file || !user.file.url) {
      return res.status(404).json({
        error: "No file found for this user",
      });
    }

    // Parse the URL to determine protocol
    const fileUrl = new URL(user.file.url);
    const protocol = fileUrl.protocol === "https:" ? https : http;

    // Proxy the file from Cloudinary
    protocol
      .get(user.file.url, (proxyRes) => {
        // Set appropriate headers
        res.setHeader(
          "Content-Type",
          proxyRes.headers["content-type"] || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${user.file.filename}"`
        );
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Pipe the file data
        proxyRes.pipe(res);
      })
      .on("error", (error) => {
        console.error("Error proxying file:", error);
        res.status(500).json({
          error: "Failed to retrieve file",
          details: error.message,
        });
      });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({
      error: "Failed to get file",
      details: error.message,
    });
  }
};
