const fs = require('fs');
const path = require('path');
const { Document, User, Loan, sequelize } = require('../models');
const { logAction } = require('./admin.controller'); // Reuse audit logger

// ==========================================
// 🛡️ FILE UPLOAD CONFIGURATION (Multer)
// ==========================================
// In production, replace this with AWS S3 storage
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    // Create folder if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Secure filename: timestamp-random-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File Filter (Security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
  fileFilter: fileFilter
});

// ==========================================
// 📂 CONTROLLER LOGIC
// ==========================================

// @desc    Upload User Avatar
// @route   POST /api/documents/avatar
exports.uploadAvatar = [
  upload.single('avatar'), // Middleware
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      // In a real app, delete old avatar file here to save space
      
      // Update User Profile with file path (or S3 URL)
      // Note: We store the relative path
      user.avatarUrl = `/uploads/${req.file.filename}`;
      await user.save();

      // Audit Log
      logAction(req.user.id, 'UPLOAD_AVATAR', 'User', user.id, { filename: req.file.filename }, req);

      res.json({ 
        message: 'Avatar updated successfully', 
        avatarUrl: user.avatarUrl 
      });

    } catch (error) {
      console.error("[AVATAR UPLOAD ERROR]", error);
      res.status(500).json({ message: 'Avatar upload failed.', error: error.message });
    }
  }
];

// @desc    Upload Loan Document (Bank Statements, ID, etc.)
// @route   POST /api/documents/loan/:loanId
exports.uploadLoanDocument = [
  upload.single('document'), // Middleware
  async (req, res) => {
    const t = await sequelize.transaction(); // Use transaction for integrity
    try {
      const { loanId } = req.params;
      const { type } = req.body; // e.g., 'bank_statement', 'tax_return'

      if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

      const loan = await Loan.findByPk(loanId);
      if (!loan) {
        // Clean up uploaded file if loan invalid
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Loan not found.' });
      }

      // Check Permissions: Only Borrower or Admin can upload
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin' && req.user.id !== loan.userId) {
         fs.unlinkSync(req.file.path);
         return res.status(403).json({ message: 'Access Denied.' });
      }

      // Create Document Record
      const doc = await Document.create({
        loanId: loan.id,
        userId: req.user.id,
        type: type || 'uncategorized',
        url: `/uploads/${req.file.filename}`,
        status: 'pending_review',
        mimeType: req.file.mimetype,
        size: req.file.size
      }, { transaction: t });

      await t.commit();

      // Audit Log
      logAction(req.user.id, 'UPLOAD_DOCUMENT', 'Loan', loan.id, { docId: doc.id, type }, req);

      res.json({ 
        message: 'Document uploaded successfully', 
        document: doc 
      });

    } catch (error) {
      await t.rollback();
      // Clean up file on error
      if (req.file) fs.unlinkSync(req.file.path);
      
      console.error("[DOCUMENT UPLOAD ERROR]", error);
      res.status(500).json({ message: 'Document upload failed.', error: error.message });
    }
  }
];

// @desc    Get Documents for a Loan
// @route   GET /api/documents/loan/:loanId
exports.getLoanDocuments = async (req, res) => {
  try {
    const { loanId } = req.params;
    const documents = await Document.findAll({
      where: { loanId },
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'uploader', attributes: ['id', 'name'] }]
    });

    res.json(documents);
  } catch (error) {
    console.error("[GET DOCUMENTS ERROR]", error);
    res.status(500).json({ message: 'Failed to retrieve documents.' });
  }
};

// @desc    Review Document (Approve/Reject)
// @route   PUT /api/documents/:id/review
exports.reviewDocument = async (req, res) => {
  try {
    const { status, adminNotes } = req.body; // 'approved' or 'rejected'
    const doc = await Document.findByPk(req.params.id);

    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    doc.status = status;
    doc.adminNotes = adminNotes;
    await doc.save();

    logAction(req.user.id, 'REVIEW_DOCUMENT', 'Document', doc.id, { status, notes: adminNotes }, req);

    res.json({ message: `Document marked as ${status}`, document: doc });
  } catch (error) {
    console.error("[REVIEW DOCUMENT ERROR]", error);
    res.status(500).json({ message: 'Review failed.' });
  }
};

// @desc    Download Document (Secure Stream)
// @route   GET /api/documents/:id/download
exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    // Permissions Check
    // (Add your logic here: Owner, Admin, Lender of this loan)

    // Construct absolute path
    const filePath = path.join(__dirname, '..', doc.url); // doc.url is like '/uploads/xyz.pdf'

    if (fs.existsSync(filePath)) {
       // Log download
       logAction(req.user.id, 'DOWNLOAD_DOCUMENT', 'Document', doc.id, {}, req);
       res.download(filePath);
    } else {
       res.status(404).json({ message: 'File not found on server.' });
    }
  } catch (error) {
    console.error("[DOWNLOAD ERROR]", error);
    res.status(500).json({ message: 'Download failed.' });
  }
};