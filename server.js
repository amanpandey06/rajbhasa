const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
const axios = require('axios');
const OPENAI_API_KEY = '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'; // <-- Replace with your actual API key
const natural = require('natural');
const classifier = new natural.BayesClassifier();

const faqIntents = [
  { intent: 'exam_date', examples: ['exam date', 'when is exam', 'pariksha kab hai', 'semester exam', 'test schedule'] },
  { intent: 'admission_form', examples: ['admission form', 'how to apply', 'application form', 'admission process'] },
  { intent: 'hostel_fee', examples: ['hostel fee', 'hostel charges', 'hostel kiraya', 'hostel cost'] },
  { intent: 'scholarship', examples: ['scholarship', 'fee concession', 'scholarship form', 'financial aid'] },
  { intent: 'placement', examples: ['placement', 'job', 'campus placement', 'placement drive'] },
  { intent: 'contact', examples: ['contact', 'phone', 'helpdesk', 'college contact'] },
  { intent: 'library_timing', examples: ['library timing', 'library hours', 'pustakalaya', 'library open'] },
  { intent: 'class_timing', examples: ['class timing', 'lecture time', 'attendance', 'class start'] },
  { intent: 'transport', examples: ['bus', 'transport', 'college bus', 'bus timing'] },
  { intent: 'fee_payment', examples: ['fee payment', 'pay fee', 'deposit fee', 'fee online', 'fee offline'] }
];

faqIntents.forEach(item => {
  item.examples.forEach(ex => classifier.addDocument(ex, item.intent));
});
classifier.train();

// FAQ answers
const faqAnswers = {
  exam_date: "Semester exams will start from 15th September 2025. Check the Student Portal for timetable.",
  admission_form: "Admission form is available online under Admissions > Apply Now.",
  hostel_fee: "Hostel fee is ₹12,000 per semester.",
  scholarship: "Scholarship forms are available in the Scholarship Section of the website.",
  placement: "Placement drives are conducted every semester. Check Training & Placement Cell board.",
  contact: "Contact: +91-99999-99999 (Helpdesk) or help@college.edu",
  library_timing: "Library is open from 9 AM to 6 PM on working days.",
  class_timing: "Classes start from 9:30 AM and attendance is compulsory.",
  transport: "College buses run on all major city routes. Timings are on the notice board.",
  fee_payment: "Fee can be paid online via Student Portal or offline in Accounts Section."
};
const PORT = 3000;

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) throw err;
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

app.post('/api/login', (req, res) => {
app.post('/api/intent', (req, res) => {
app.post('/api/chatgpt', async (req, res) => {
app.post('/api/gemini', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text }] }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    const answer = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer from Gemini.';
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'Gemini API error', details: err.message });
  }
});
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text }],
      max_tokens: 256
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const answer = response.data.choices[0].message.content;
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: 'OpenAI API error', details: err.message });
  }
});
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'No text provided' });
  const intent = classifier.classify(text);
  const answer = faqAnswers[intent] || "Sorry, I couldn't understand your question.";
  res.json({ intent, answer });
});
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
