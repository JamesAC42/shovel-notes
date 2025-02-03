const express = require('express');
const session  = require('express-session');
const RedisStore = require('connect-redis')(session);
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const redisConfig = require('./config/redis.json');
const Redis = require('ioredis');
const env = require('./config/env.json');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5016;
const BACKUP_FILE = path.join(__dirname, 'database', 'flashcards.json');
const handleConnection = require('./socket');

// Modify the Redis connection setup
let redis = new Redis({
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password
});

app.use(express.json());
app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: 'domoarigato',
    resave: false,
    name: 'shovel-session',
    saveUninitialized: false,
    cookie: {
      secure: env.secureSession, 
      domain: 'ovel.sh',
      path:'/',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    },
  })
);

let io;
if(env.local) {
  io = new Server(httpServer, {
    cors: {
      origin: '*'
    }
  });
} else {
  io = new Server(httpServer, {
  	path:'/socket',
    cors: {
        origin: 'https://notes.ovel.sh',
        methods: ['GET','POST']
    } 
  });
}

// Simple queue implementation
const queue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const task = queue.shift();
  
  try {
    await task();
  } catch (error) {
    console.error('Error processing task:', error);
  }
  
  isProcessing = false;
  processQueue();
}

function addToQueue(task) {
  return new Promise((resolve, reject) => {
    queue.push(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

// Modify the database structure
async function ensureRedisStructure() {
  const exists = await redis.exists('flashcards:decks');
  if (!exists) {
    await redis.sadd('flashcards:decks', 'initial');
    await redis.hmset('flashcards:initial', 'name', 'Initial Deck', 'notes', ' ');
    await redis.rpush('flashcards:initial:cards', JSON.stringify({
      id: Date.now().toString(),
      front: 'Sample front',
      back: 'Sample back',
      starred: false,
      learned: false,
    }));
  }
}

// Read database
async function readDatabase() {
  const deckIds = await redis.smembers('flashcards:decks');
  const decks = [];

  for (const deckId of deckIds) {
    const deckInfo = await redis.hgetall(`flashcards:${deckId}`);
    const cards = await redis.lrange(`flashcards:${deckId}:cards`, 0, -1);
    decks.push({
      id: deckId,
      name: deckInfo.name,
      notes: deckInfo.notes,
      flashcards: cards.map(JSON.parse),
    });
  }

  return { decks };
}

// Write database
async function writeDatabase(data) {
  // This function will now be used for backing up to JSON
  await fs.writeFile(BACKUP_FILE, JSON.stringify(data, null, 2));
}

// Backup function
async function backupToJson() {
  const data = await readDatabase();
  await writeDatabase(data);
  console.log('Backup completed');
}

// Schedule regular backups every 20 minutes
//setInterval(backupToJson, 1000 * 60 * 20);

// Import controllers
//const { getDecks } = require('./controllers/get/decks/getDecks');
//const { getDeck } = require('./controllers/get/decks/getDeck');
//const { updateDeckNotes } = require('./controllers/put/decks/updateDeckNotes');
//const { updateFlashcard } = require('./controllers/put/decks/updateFlashcard');
//const { createDeck } = require('./controllers/post/decks/createDeck');
//const { addFlashcard } = require('./controllers/post/decks/addFlashcard');
//const { generateFlashcards } = require('./controllers/post/decks/generateFlashcards');
//const { updateDeck } = require('./controllers/put/decks/updateDeck');
//const { deleteFlashcard } = require('./controllers/delete/decks/deleteFlashcard');
//const { deleteDeck } = require('./controllers/delete/decks/deleteDeck');

const { getUser } = require('./controllers/get/user/getUser');
const { getRoom } = require('./controllers/get/room/getRoom');
const { deleteNotebookPage } = require('./controllers/delete/notebook/deleteNotebookPage');
const { renameNotebookPage } = require('./controllers/put/notebook/renameNotebookPage');
const { createNotebookPage } = require('./controllers/post/notebook/createNotebookPage');
const { updateNotebookPageContent } = require('./controllers/put/notebook/updateNotebookPageContent');
const { getFolderContent } = require('./controllers/get/notebook/getFolderContent');
const { getPageContent } = require('./controllers/get/notebook/getPageContent');
const { getAllPages } = require('./controllers/get/notebook/getAllPages');

const { getAllDecksInRoom } = require('./controllers/decks/getAllDecksInRoom');
const { createDeck } = require('./controllers/decks/createDeck');
const { renameDeck } = require('./controllers/decks/renameDeck');
const { deleteDeck } = require('./controllers/decks/deleteDeck');
const { updateLastStudied } = require('./controllers/decks/updateLastStudied');
const { createDeckFromNotes } = require('./controllers/decks/createDeckFromNotes');

const { createFlashcardController } = require('./controllers/flashcards/createFlashcard');
const { deleteFlashcard } = require('./controllers/flashcards/deleteFlashcard');
const { updateFlashcard } = require('./controllers/flashcards/updateFlashcard');
const { getAllFlashcardsInDeck } = require('./controllers/flashcards/getAllFlashcardsInDeck');

const { createQuiz } = require('./controllers/quizzes/createQuiz');
const { getAllQuizzesInRoom } = require('./controllers/quizzes/getAllQuizzesInRoom');
const { getQuizQuestions } = require('./controllers/quizzes/getQuizQuestions');
const { createQuizQuestion } = require('./controllers/quizzes/createQuizQuestion');
const { updateQuiz } = require('./controllers/quizzes/updateQuiz');
const { deleteQuiz } = require('./controllers/quizzes/deleteQuiz');
const { createQuizFromNotes } = require('./controllers/quizzes/createQuizFromNotes');
const { deleteQuizQuestion } = require('./controllers/quizzes/deleteQuizQuestion');
const { submitQuizAttempt } = require('./controllers/quizzes/submitQuizAttempt');
const { getQuizAttempts } = require('./controllers/quizzes/getQuizAttempts');
const { getQuizAttemptDetails } = require('./controllers/quizzes/getQuizAttemptDetails');

// Routes
app.post('/notebook/page', (req, res) => createNotebookPage(req, res, io));
app.delete('/notebook/page', (req, res) => deleteNotebookPage(req, res, io));
app.put('/notebook/renamePage', (req, res) => renameNotebookPage(req, res, io));
app.put('/notebook/updatePageContent', (req, res) => updateNotebookPageContent(req, res, io));

app.get('/user', getUser);
app.get('/room', (req, res) => getRoom(req, res, redis));

app.get('/notebook/folder/:id', getFolderContent);
app.get('/notebook/page/:id', getPageContent);
app.get('/notebook/allPages/:roomId', getAllPages);

app.get('/decks/get', getAllDecksInRoom);
app.post('/decks/create', (req, res) => createDeck(req, res, io));
app.post('/decks/createFromNotes', (req, res) => createDeckFromNotes(req, res, io, redis));
app.post('/decks/delete', (req, res) => deleteDeck(req, res, io));
app.post('/decks/rename', (req, res) => renameDeck(req, res, io));
app.post('/decks/updateLastStudied', (req, res) => updateLastStudied(req, res, io));

app.get('/decks/getFlashcardsInDeck', getAllFlashcardsInDeck);
app.post('/decks/addFlashcard', (req, res) => createFlashcardController(req, res, io));
app.post('/decks/deleteFlashcard', (req, res) => deleteFlashcard(req, res, io));
app.post('/decks/updateFlashcard', (req, res) => updateFlashcard(req, res, io));

app.get('/quizzes/get', getAllQuizzesInRoom);
app.get('/quizzes/questions/:quizId', getQuizQuestions);
app.post('/quizzes/create', (req, res) => createQuiz(req, res, io));
app.post('/quizzes/questions/create', (req, res) => createQuizQuestion(req, res, io));
app.put('/quizzes/update', (req, res) => updateQuiz(req, res, io));
app.post('/quizzes/delete', (req, res) => deleteQuiz(req, res, io));
app.post('/quizzes/createFromNotes', (req, res) => createQuizFromNotes(req, res, io, redis));
app.delete('/quizzes/question/delete', (req, res) => deleteQuizQuestion(req, res, io));
app.post('/quizzes/submit', (req, res) => submitQuizAttempt(req, res, io));
app.get('/quizzes/attempts/:quizId', getQuizAttempts);
app.get('/quizzes/attempts/:quizId/:attemptId', getQuizAttemptDetails);

io.on('connection', handleConnection);

// Start the server
async function startServer() {
  await ensureRedisStructure();
  
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
