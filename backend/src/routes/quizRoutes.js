const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect, restrictTo } = require('../middleware/auth');
const {
  generateQuiz,
  getMyQuizzes,
  getQuizById,
  publishQuiz,
  getPublishedQuizzes,
} = require('../controllers/quizController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = express.Router();

router.post('/generate', protect, restrictTo('teacher'), upload.single('pdf'), generateQuiz);
router.get('/my', protect, restrictTo('teacher'), getMyQuizzes);
router.get('/published', protect, getPublishedQuizzes);
router.get('/:id', protect, getQuizById);
router.patch('/:id/publish', protect, restrictTo('teacher'), publishQuiz);

module.exports = router;