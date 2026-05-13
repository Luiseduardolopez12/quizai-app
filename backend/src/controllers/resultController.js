const Result = require('../models/Result');
const Quiz = require('../models/Quiz');
const { generateReview } = require('../config/ai');

const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({ message: 'Este quiz no esta publicado' });
    }

    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      return {
        questionIndex: answer.questionIndex,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const correctCount = processedAnswers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / quiz.questions.length) * 100);

    const result = await Result.create({
      student: req.user._id,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalQuestions: quiz.questions.length,
    });

    const wrongIndexes = processedAnswers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionIndex);

    const wrongQuestions = wrongIndexes.map((i) => quiz.questions[i]);

    let reviewMaterial = null;
    if (wrongQuestions.length > 0) {
      reviewMaterial = await generateReview(wrongQuestions);
    }

    res.status(201).json({
      message: 'Quiz completado',
      result: {
        score,
        totalQuestions: quiz.questions.length,
        correctCount,
        answers: processedAnswers.map((a, i) => ({
          questionIndex: a.questionIndex,
          questionText: quiz.questions[a.questionIndex].questionText,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: quiz.questions[a.questionIndex].correctAnswer,
          isCorrect: a.isCorrect,
          explanation: quiz.questions[a.questionIndex].explanation,
        })),
      },
      reviewMaterial,
    });
  } catch (error) {
    console.log('Error submitiendo quiz:', error.message);
    res.status(500).json({ message: 'Error al enviar respuestas', error: error.message });
  }
};

const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'title description')
      .sort({ createdAt: -1 });
    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo resultados', error: error.message });
  }
};

const getQuizResults = async (req, res) => {
  try {
    const results = await Result.find({ quiz: req.params.quizId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const scores = results.map((r) => r.score);
    const average = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    res.json({
      results,
      stats: {
        totalStudents: results.length,
        averageScore: average,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo resultados', error: error.message });
  }
};

module.exports = { submitQuiz, getMyResults, getQuizResults };