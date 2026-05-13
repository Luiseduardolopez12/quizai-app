const fs = require('fs');
const Quiz = require('../models/Quiz');
const { generateQuestions } = require('../config/ai');

const extractTextFromPDF = async (filePath) => {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
};

const generateQuiz = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subio ningun archivo PDF' });
    }

    const { title, description, timeLimit, numQuestions } = req.body;

    const extractedText = await extractTextFromPDF(req.file.path);

    if (!extractedText || extractedText.trim().length < 100) {
      return res.status(400).json({ message: 'El PDF no contiene suficiente texto' });
    }

    const aiResponse = await generateQuestions(
      extractedText,
      parseInt(numQuestions) || 5
    );

    const quiz = await Quiz.create({
      title,
      description,
      teacher: req.user._id,
      questions: aiResponse.questions,
      timeLimit: parseInt(timeLimit) || 30,
      sourceFile: req.file.originalname,
      isPublished: false,
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Quiz generado exitosamente',
      quiz,
    });
  } catch (error) {
    console.log('Error generando quiz:', error.message);
    res.status(500).json({ message: 'Error generando quiz', error: error.message });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user._id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo quizzes', error: error.message });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo quiz', error: error.message });
  }
};

const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user._id },
      { isPublished: true },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz no encontrado' });
    }
    res.json({ message: 'Quiz publicado', quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error publicando quiz', error: error.message });
  }
};

const getPublishedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true })
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo quizzes', error: error.message });
  }
};

module.exports = {
  generateQuiz,
  getMyQuizzes,
  getQuizById,
  publishQuiz,
  getPublishedQuizzes,
};