// import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cors from "cors";
// import helmet from "helmet";
// import authRoutes from "./routes/authRoutes.js"; // Auth routes
// import userRoutes from "./routes/userRoutes.js"; // User routes (commented for now)

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 8000;
// const MONGODBURL = process.env.MONGODB_URI;

// console.log("Full server loaded");

// // Helmet for security
// app.use(helmet());
// console.log("Helmet applied");

// // CORS for frontend
// app.use(cors({ origin: true, credentials: true }));
// console.log("CORS applied");

// // Body parsers
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// console.log("Body parsers applied");

// // Mount auth routes (public)
// app.use("/api/auth", authRoutes);
// console.log("Auth routes mounted at /api/auth");

// // Mount user routes (protected - commented for now)
// app.use("/api", userRoutes);
// console.log("User routes mounted at /api");

// // Root route
// app.get("/", (req, res) => {
//   console.log("Root route HIT!");
//   res.send("Server is working!");
// });

// // API test route
// app.get("/api/test", (req, res) => {
//   console.log("API test route HIT!");
//   res.json({ message: "API test working with full setup!" });
// });

// // DB connect
// mongoose
//   .connect(MONGODBURL)
//   .then(() => {
//     console.log("DB connected");
//     app.listen(PORT, () => {
//       console.log(`Server listening on ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error("DB error:", error);
//   });

// // Basic 404
// app.use((req, res) => {
//   console.log(`404 for ${req.method} ${req.url}`);
//   res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
// });





import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { v2 as cloudinary } from "cloudinary";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const MONGODBURL = process.env.MONGODB_URI;

// --- CLOUDINARY CONFIG + LOGGING ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
async function testCloudinary() {
  try {
    await cloudinary.api.ping();
    console.log("Cloudinary connected successfully ");
  } catch (err) {
    console.error("Cloudinary connection failed ❌", err.message);
  }
}

// Run test
testCloudinary();

console.log("Full server loaded");

// Helmet for security
app.use(helmet());
console.log("Helmet applied");

// CORS
app.use(cors({ origin: true, credentials: true }));
console.log("CORS applied");

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("Body parsers applied");

// Routes
app.use("/api/auth", authRoutes);
console.log("Auth routes mounted at /api/auth");

// userRoutes
app.use("/api/users", userRoutes);
console.log("User routes mounted at /api/users");

// postRoutes
app.use("/api/posts", postRoutes);
console.log("Post routes mounted at /api/posts");

// Root
app.get("/", (req, res) => {
  console.log("Root route HIT!");
  res.send("Server is working!");
});

// API test
app.get("/api/test", (req, res) => {
  console.log("API test route HIT!");
  res.json({ message: "API test working with full setup!" });
});

// DB connect
mongoose
  .connect(MONGODBURL)
  .then(() => {
    console.log("DB connected");
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("DB error:", error);
  });

// 404
app.use((req, res) => {
  console.log(`404 for ${req.method} ${req.url}`);
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});
