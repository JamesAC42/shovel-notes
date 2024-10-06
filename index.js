const express = require('express');
const session  = require('express-session');
const RedisStore = require('connect-redis')(session);
const fs = require('fs').promises;
const path = require('path');
const redisConfig = require('./config/redis.json');
const Redis = require('ioredis');
const env = require('./config/env.json');

const sequelize = require('./database');

const app = express();
const PORT = process.env.PORT || 5015;
const BACKUP_FILE = path.join(__dirname, 'database', 'flashcards.json');

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
    saveUninitialized: false,
    cookie: {
      secure: env.secureSession, // Set to true if using HTTPS
    },
  })
);

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
setInterval(backupToJson, 1000 * 60 * 20);

// Import controllers
const { getDecks } = require('./controllers/get/decks/getDecks');
const { getDeck } = require('./controllers/get/decks/getDeck');
const { createDeck } = require('./controllers/post/decks/createDeck');
const { addFlashcard } = require('./controllers/post/decks/addFlashcard');
const { generateFlashcards } = require('./controllers/post/decks/generateFlashcards');
const { updateDeckNotes } = require('./controllers/put/decks/updateDeckNotes');
const { updateFlashcard } = require('./controllers/put/decks/updateFlashcard');
const { updateDeck } = require('./controllers/put/decks/updateDeck');
const { deleteFlashcard } = require('./controllers/delete/decks/deleteFlashcard');
const { deleteDeck } = require('./controllers/delete/decks/deleteDeck');

// Routes
app.get('/decks', (req, res) => getDecks(req, res, redis, addToQueue, readDatabase));
app.get('/decks/:id', (req, res) => getDeck(req, res, redis, addToQueue));
app.post('/decks', (req, res) => createDeck(req, res, redis, addToQueue));
app.post('/decks/:id/flashcards', (req, res) => addFlashcard(req, res, redis, addToQueue));
app.post('/decks/:id/generate-flashcards', (req, res) => generateFlashcards(req, res, redis, addToQueue));
app.put('/decks/:id/notes', (req, res) => updateDeckNotes(req, res, redis, addToQueue));
app.put('/decks/:deckId/flashcards/:flashcardId', (req, res) => updateFlashcard(req, res, redis, addToQueue));
app.put('/decks/:id', (req, res) => updateDeck(req, res, redis, addToQueue));
app.delete('/decks/:deckId/flashcards/:flashcardId', (req, res) => deleteFlashcard(req, res, redis, addToQueue));
app.delete('/decks/:id', (req, res) => deleteDeck(req, res, redis, addToQueue));

// Start the server
async function startServer() {
  await ensureRedisStructure();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();