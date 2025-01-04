const {complete} = require('./anthropic');
const prompts = require('./prompts');

const generatePrompt = (notes) => {
    const noteString = notes.join('\n');
    return prompts.generateQuizUser_1 + noteString + prompts.generateQuizUser_2;
}

const generateQuiz = async (notes) => {
    try {
        const prompt = generatePrompt(notes);
        const response = await complete(prompts.generateQuizSystem, prompt);
        const generatedQuestions = JSON.parse(response);
        
        if (!Array.isArray(generatedQuestions)) {
            throw new Error('Generated questions is not an array');
        }

        return generatedQuestions;
    } catch (error) {
        console.error('Failed to generate quiz:', error);
        throw error;
    }
}

module.exports = generateQuiz; 