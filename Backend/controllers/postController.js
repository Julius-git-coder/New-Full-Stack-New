// Backend/controllers/postController.js
import PostModel from "../models/postModel.js";
import cloudinary from "../config/cloudinary.js";
import https from "https";
import http from "http";

// Get all posts (for users dashboard)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate("author", "name email");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({
      error: "Failed to fetch posts",
      details: error.message,
    });
  }
};

// Get single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate(
      "author",
      "name email"
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({
      error: "Failed to fetch post",
      details: error.message,
    });
  }
};

// Create new post (admin only)
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const newPost = {
      title,
      content,
      author: req.user._id,
      authorName: req.user.name,
    };

    // If file is uploaded, upload to Cloudinary
    if (req.file) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "posts",
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

        newPost.file = {
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

    const post = await PostModel.create(newPost);

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(400).json({
      error: "Failed to create post",
      details: error.message,
    });
  }
};

// Update post (admin only)
export const updatePost = async (req, res) => {
  try {
    const { title, content, isPublished } = req.body;
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Update basic fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (isPublished !== undefined) post.isPublished = isPublished;

    // If new file is uploaded
    if (req.file) {
      // Delete old file from Cloudinary if exists
      if (post.file && post.file.publicId) {
        try {
          await cloudinary.uploader.destroy(post.file.publicId);
          console.log("Old file deleted from Cloudinary:", post.file.publicId);
        } catch (error) {
          console.error("Error deleting old file:", error);
        }
      }

      // Upload new file
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "posts",
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

        post.file = {
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

    await post.save();

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      error: "Failed to update post",
      details: error.message,
    });
  }
};

// Delete post (admin only)
export const deletePost = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Delete file from Cloudinary if exists
    if (post.file && post.file.publicId) {
      try {
        await cloudinary.uploader.destroy(post.file.publicId);
        console.log("File deleted from Cloudinary:", post.file.publicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
      }
    }

    await PostModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      error: "Failed to delete post",
      details: error.message,
    });
  }
};

// Download/view post file
export const downloadPostFile = async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!post.file || !post.file.url) {
      return res.status(404).json({
        error: "No file found for this post",
      });
    }

    const fileUrl = new URL(post.file.url);
    const protocol = fileUrl.protocol === "https:" ? https : http;

    protocol
      .get(post.file.url, (proxyRes) => {
        res.setHeader(
          "Content-Type",
          proxyRes.headers["content-type"] || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${post.file.filename}"`
        );
        res.setHeader("Access-Control-Allow-Origin", "*");

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
