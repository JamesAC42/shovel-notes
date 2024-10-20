const prompts = {

    generateFlashcardsSystem: "You are an expert flashcard creator. Your task is to generate comprehensive, high-quality flashcards from given notes. Focus on creating concise, clear questions and answers that cover all key concepts.",
    generateFlashcardsUser_1: `
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

<notes>\n`,
    generateFlashcardsUser_2: `
\n
</notes>
`

}

module.exports = prompts;
