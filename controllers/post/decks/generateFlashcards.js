const Anthropic = require('@anthropic-ai/sdk');
const anthropicConfig = require('../../../config/anthropic.json');
const anthropic = new Anthropic({
  apiKey: anthropicConfig.apiKey,
});

async function generateFlashcards(req, res, redis, addToQueue) {
  try {
    const { notes } = req.body;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 8192,
      system: "You are an expert flashcard creator. Your task is to generate comprehensive, high-quality flashcards from given notes. Focus on creating concise, clear questions and answers that cover all key concepts.",
      messages: [
        {
          role: "user",
          content: `
Create flashcards from the following notes. Generate as many cards as necessary to cover all important information. Each flashcard should have a 'front' (question) and 'back' (answer). 

Instructions:
1. Analyze the notes thoroughly.
2. Identify all key concepts, definitions, and important details.
3. Create a flashcard for each distinct piece of information.
4. Ensure questions are clear and specific.
5. Keep answers concise but complete.
6. Use a variety of question types (e.g., definition, explanation, comparison).
7. Avoid redundancy between cards.
8. Format your response as a JSON array of flashcard objects.

<output_format>
<example_format>
[
  {
    "front": "What is the capital of France?",
    "back": "Paris"
  },
  {
    "front": "List the three states of matter.",
    "back": "Solid, liquid, and gas"
  }
]
</example_format>

Your response must be a valid JSON array of flashcard objects, without any additional text or explanation. Each object should have 'front' and 'back' properties.
</output_format>

Notes: ${notes}`
        }
      ]
    });

    let generatedFlashcards = JSON.parse(response.content[0].text);

    if (!Array.isArray(generatedFlashcards)) {
      throw new Error('Generated flashcards is not an array');
    }

    const newFlashcards = generatedFlashcards.map(card => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
      ...card,
      starred: false,
      learned: false,
    }));

    await addToQueue(async () => {
      await redis.del(`flashcards:${req.params.id}:cards`);
      await redis.rpush(`flashcards:${req.params.id}:cards`, ...newFlashcards.map(JSON.stringify));
    });
    
    res.status(201).json(newFlashcards);
  } catch (error) {
    console.error('Failed to generate flashcards:', error);
    res.status(500).json({ error: 'Failed to generate flashcards', details: error.message });
  }
}

module.exports = { generateFlashcards };