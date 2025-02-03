const { complete } = require('./anthropic');
const prompts = require('./prompts');

const generateGradingPrompt = (questions) => {
    const questionsText = questions.map(q => `
<question id="${q.id}">
<prompt>${q.prompt}</prompt>
<correct_answer>${q.correctAnswer}</correct_answer>
<student_response>${q.userAnswer}</student_response>
</question>`).join('\n');

    return prompts.gradeQuizUser_1 + questionsText + prompts.gradeQuizUser_2;
};

const generateOverallFeedbackPrompt = (quizSummary) => {
    const summaryText = quizSummary.map(q => `
<question>
<prompt>${q.prompt}</prompt>
<student_response>${q.userAnswer}</student_response>
<correct>${q.isCorrect}</correct>
<feedback>${q.feedback || ''}</feedback>
</question>`).join('\n');

    return prompts.overallFeedbackUser_1 + summaryText + prompts.overallFeedbackUser_2;
};

const gradeOpenEndedQuestions = async (questions) => {
    try {
        console.log('Generating grading prompt for questions:', {
            numQuestions: questions.length,
            questions: questions.map(q => ({
                id: q.id,
                promptLength: q.prompt.length,
                answerLength: q.userAnswer.length
            }))
        });

        const prompt = generateGradingPrompt(questions);
        console.log('Generated grading prompt:', {
            promptLength: prompt.length,
            prompt: prompt.substring(0, 200) + '...'
        });

        const response = await complete(prompts.gradeQuizSystem, prompt);
        console.log('Received LLM response:', {
            responseLength: response.length,
            response: response.substring(0, 200) + '...'
        });

        const parsedResponse = JSON.parse(response);
        console.log('Parsed LLM response:', parsedResponse);

        return parsedResponse;
    } catch (error) {
        console.error('Error grading open-ended questions:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

const getOverallFeedback = async (quizSummary) => {
    try {
        console.log('Generating overall feedback prompt:', {
            numQuestions: quizSummary.length,
            summary: quizSummary.map(q => ({
                promptLength: q.prompt.length,
                hasResponse: !!q.userAnswer,
                hasExistingFeedback: !!q.feedback
            }))
        });

        const prompt = generateOverallFeedbackPrompt(quizSummary);
        console.log('Generated overall feedback prompt:', {
            promptLength: prompt.length,
            prompt: prompt.substring(0, 200) + '...'
        });

        const response = await complete(prompts.overallFeedbackSystem, prompt);
        console.log('Received overall feedback response:', {
            responseLength: response.length,
            response: response.substring(0, 200) + '...'
        });

        return response;
    } catch (error) {
        console.error('Error getting overall feedback:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = { gradeOpenEndedQuestions, getOverallFeedback }; 