const Groq = require('groq-sdk');

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generateQuestions = async (text, numQuestions = 5) => {
  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en educacion. Respondes UNICAMENTE con JSON valido, sin texto adicional, sin markdown, sin backticks.',
      },
      {
        role: 'user',
        content: `Basandote en el siguiente texto, genera exactamente ${numQuestions} preguntas de evaluacion.

Texto:
${text.substring(0, 3000)}

Responde UNICAMENTE con este JSON exacto:
{
  "questions": [
    {
      "questionText": "pregunta aqui",
      "options": ["opcion A", "opcion B", "opcion C", "opcion D"],
      "correctAnswer": 0,
      "explanation": "explicacion de por que es correcta"
    }
  ]
}

correctAnswer es el indice (0,1,2,3) de la opcion correcta.`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

const generateReview = async (wrongQuestions) => {
  const questionsText = wrongQuestions
    .map((q, i) => `${i + 1}. ${q.questionText}`)
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 1500,
    messages: [
      {
        role: 'system',
        content: 'Eres un experto en educacion. Respondes UNICAMENTE con JSON valido, sin texto adicional, sin markdown, sin backticks.',
      },
      {
        role: 'user',
        content: `Un estudiante fallo las siguientes preguntas en un quiz:
${questionsText}

Genera material de repaso personalizado con este JSON exacto:
{
  "summary": "resumen corto de los temas a repasar",
  "topics": [
    {
      "topic": "nombre del tema",
      "explanation": "explicacion clara del concepto",
      "example": "ejemplo practico",
      "practiceQuestion": "pregunta de practica",
      "practiceAnswer": "respuesta de la pregunta de practica"
    }
  ]
}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { generateQuestions, generateReview };