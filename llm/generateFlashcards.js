const {complete} = require('./anthropic');
const prompts = require('./prompts');

const generatePrompt = (notes) => {

    const noteString = notes.join('\n');
    return prompts.generateFlashcardsUser_1 + noteString + prompts.generateFlashcardsUser_2;

}

const generateFlashcards = async (notes) => {
    
    try {
        
        const prompt = generatePrompt(notes);
        const response = await complete(prompts.generateFlashcardsSystem, prompt);
        const generatedFlashcards = JSON.parse(response);
        if (!Array.isArray(generatedFlashcards)) {
            throw new Error('Generated flashcards is not an array');
        }

        return generatedFlashcards;

    } catch (error) {
        console.error('Failed to generate flashcards:', error);
        throw error;
    }


}

module.exports = generateFlashcards;