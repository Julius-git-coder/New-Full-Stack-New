import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Enhanced file-type validation with better debugging
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  console.log("File upload attempt:", {
    originalname: file.originalname,
    extension: ext,
    mimetype: mime,
  });

  // Allowed image types
  const allowedImageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const allowedImageMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
  ];

  // Allowed document types
  const allowedDocExts = [".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt"];
  const allowedDocMimes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain", // .txt
    "application/rtf", // .rtf
    "text/rtf", // .rtf (alternative)
    "application/vnd.oasis.opendocument.text", // .odt
  ];

  // Check if it's an allowed image
  if (allowedImageExts.includes(ext) && allowedImageMimes.includes(mime)) {
    console.log("✅ Image file accepted:", file.originalname);
    return cb(null, true);
  }

  // Check if it's an allowed document
  if (allowedDocExts.includes(ext) && allowedDocMimes.includes(mime)) {
    console.log("✅ Document file accepted:", file.originalname);
    return cb(null, true);
  }

  // Special case: Sometimes .doc files come with octet-stream
  if (
    ext === ".doc" &&
    (mime === "application/msword" || mime === "application/octet-stream")
  ) {
    console.log("✅ DOC file accepted (octet-stream):", file.originalname);
    return cb(null, true);
  }

  // Special case: Sometimes files come with octet-stream, check extension only
  if (mime === "application/octet-stream") {
    if ([...allowedImageExts, ...allowedDocExts].includes(ext)) {
      console.log(
        "✅ File accepted by extension (octet-stream):",
        file.originalname
      );
      return cb(null, true);
    }
  }

  // Reject if not allowed
  console.log("❌ File rejected:", {
    filename: file.originalname,
    extension: ext,
    mimetype: mime,
    reason: "Not in allowed types",
  });

  cb(
    new Error(
      `Invalid file type! Extension: ${ext}, MIME: ${mime}. Only images (JPEG, PNG, GIF, WebP, BMP) and documents (PDF, DOC, DOCX, TXT, RTF, ODT) are allowed.`
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
