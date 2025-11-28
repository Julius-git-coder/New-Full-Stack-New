import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Restricted file-type validation - Only PDF and common images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  console.log("File upload attempt:", {
    originalname: file.originalname,
    extension: ext,
    mimetype: mime,
  });

  // Allowed image types (common formats only)
  const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedImageMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  // Allowed document types (PDF only)
  const allowedDocExts = [".pdf"];
  const allowedDocMimes = ["application/pdf"];

  // Check if it's an allowed image
  if (allowedImageExts.includes(ext) && allowedImageMimes.includes(mime)) {
    console.log(" Image file accepted:", file.originalname);
    return cb(null, true);
  }

  // Check if it's an allowed document (PDF only)
  if (allowedDocExts.includes(ext) && allowedDocMimes.includes(mime)) {
    console.log(" PDF document accepted:", file.originalname);
    return cb(null, true);
  }

  // Special case: Sometimes files come with octet-stream, check extension only
  if (mime === "application/octet-stream") {
    if ([...allowedImageExts, ...allowedDocExts].includes(ext)) {
      console.log(
        " File accepted by extension (octet-stream):",
        file.originalname
      );
      return cb(null, true);
    }
  }

  // Reject if not allowed
  console.log(" File rejected:", {
    filename: file.originalname,
    extension: ext,
    mimetype: mime,
    reason: "Not in allowed types",
  });

  cb(
    new Error(
      `Invalid file type! Extension: ${ext}, MIME: ${mime}. Only common images (JPEG, PNG, GIF, WebP) and PDF documents are allowed.`
    ),
    false
  );
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

export default upload;
