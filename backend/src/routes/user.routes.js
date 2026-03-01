const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  uploadAvatar 
} = require('../controllers/user.controller');

// ==========================================
// 🖼️ AVATAR UPLOAD CONFIGURATION
// ==========================================

// 1. Ensure avatar directory exists
const avatarDir = 'uploads/avatars';
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// 2. Storage Strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    // avatar-{userId}-{timestamp}.ext
    const uniqueSuffix = Date.now();
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// 3. File Filter (Strictly Images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Limit for avatars
  fileFilter: fileFilter
});

// ==========================================
// 👤 USER ROUTES
// ==========================================

// Global Protection
router.use(protect);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/profile', getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update profile details
 * @access  Private
 */
router.put('/profile', updateUserProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Change account password
 * @access  Private
 */
router.put('/password', changePassword);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload profile picture
 * @access  Private
 */
// Note: 'avatar' string must match the frontend FormData key
router.post('/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;