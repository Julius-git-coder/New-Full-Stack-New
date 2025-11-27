

import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// Strict file-type validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Allowed image types
  const imageExts = /jpeg|jpg|png|gif/;
  const imageMimes = /image\/jpeg|image\/jpg|image\/png|image\/gif/;

  // Allowed document: ONLY PDF
  const pdfExt = ".pdf";
  const pdfMime = "application/pdf";

  // Check for PDF documents
  if (ext === pdfExt && mime === pdfMime) {
    return cb(null, true);
  }

  // Check for image files
  if (imageExts.test(ext) && imageMimes.test(mime)) {
    return cb(null, true);
  }

  // Otherwise reject
  cb(
    new Error(
      "Invalid file type! Only PDF documents or image files are allowed."
    ),
    false
  );
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

export default upload;
