import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import 'dotenv/config'

const app = express();
const port = 3000;

const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

db.connect();

// Initial Values
let totalCorrect = 0;
let currentQuestion = {};

// Data
let quiz = [
  { country: 'Greece', capital: 'Athens' },
  { country: 'France', capital: 'Paris' },
  { country: 'Russia', capital: 'Moscow' },
];

db.query('SELECT * FROM capitals', (err, res) => {
  if (err) {
    console.error('Error executing query', err.stack);
  } else {
    quiz = res.rows;
  }
  db.end();
});

// Functions
async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// GET home page
app.get('/', async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render('index.ejs', { question: currentQuestion });
});

// POST a new post
app.post('/submit', (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log("Βαθμολογία: ", totalCorrect);
    isCorrect = true;
  }
  
  nextQuestion();
  console.log(currentQuestion);
  res.render('index.ejs', {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
