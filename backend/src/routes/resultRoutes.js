const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { submitQuiz, getMyResults, getQuizResults } = require('../controllers/resultController');

const router = express.Router();

router.post('/submit', protect, restrictTo('student'), submitQuiz);
router.get('/my', protect, restrictTo('student'), getMyResults);
router.get('/quiz/:quizId', protect, restrictTo('teacher'), getQuizResults);

module.exports = router;