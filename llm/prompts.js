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
`,
    generateQuizSystem: "You are an expert quiz creator. Your task is to generate comprehensive quiz questions from given notes. Focus on creating clear questions that test understanding of key concepts.",
    
    generateQuizUser_1: `
Create quiz questions from the following notes. Generate multiple choice and open-ended questions that cover all important information.

Instructions:
1. Analyze the notes thoroughly
2. Create questions that test understanding of key concepts
3. For multiple choice questions, include one correct answer and three plausible distractors
4. For open-ended questions, provide the correct answer
5. Format response as a JSON array of question objects
6. Use question_type: 1 for multiple choice, 2 for open-ended
7. True/False questions should be used as well, formatted as a multiple choice questions with two answers, True and False, with one marked correct and the other incorrect.

DO NOT reply in anything other than the output JSON.

<output_format>
[
  {
    "question_type": 1,
    "prompt": "What is the capital of France?",
    "answers": [
      {"value": "Paris", "is_correct": true},
      {"value": "London", "is_correct": false},
      {"value": "Berlin", "is_correct": false},
      {"value": "Madrid", "is_correct": false}
    ]
  },
  {
    "question_type": 2,
    "prompt": "Explain the process of photosynthesis.",
    "answers": [
      {"value": "Photosynthesis is the process where plants convert sunlight into energy...", "is_correct": true}
    ]
  }
]
</output_format>

<notes>\n`,
    generateQuizUser_2: `\n</notes>`

}

module.exports = prompts;
