const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorize } = require('../middleware/authMiddleware');
const documentController = require('../controllers/document.controller');

// ==========================================
// 🛡️ MULTER CONFIGURATION (File Security)
// ==========================================

const uploadDir = 'uploads/documents';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|docx/;
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    return cb(null, true);
  } else {
    cb(new Error('Security Protocol: Only images, PDFs, and Word documents are permitted.'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: fileFilter
});

// ==========================================
// 📄 DOCUMENT ROUTES (Level 5 Integration)
// ==========================================

router.use(protect);

/**
 * @route   POST /api/documents/avatar
 * @desc    Upload User Profile Picture
 */
router.post('/avatar', upload.single('avatar'), documentController.uploadAvatar);

/**
 * @route   POST /api/documents/loan/:loanId
 * @desc    Upload Artifact to specific Loan Pipeline
 */
router.post('/loan/:loanId', upload.single('document'), documentController.uploadLoanDocument);

/**
 * @route   GET /api/documents/loan/:loanId
 * @desc    Fetch all artifacts for audit trail
 */
router.get('/loan/:loanId', documentController.getLoanDocuments);

/**
 * @route   GET /api/documents/:id/download
 * @desc    Secure Stream (PII Protected)
 */
router.get('/:id/download', documentController.downloadDocument);

/**
 * @route   PUT /api/documents/:id/review
 * @desc    Admin Approval/Rejection of artifact
 */
router.put('/:id/review', authorize('admin', 'super_admin'), documentController.reviewDocument);

module.exports = router;