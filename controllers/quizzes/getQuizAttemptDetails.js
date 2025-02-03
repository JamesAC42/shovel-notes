const { QuizAttempt, QuizAttemptQuestion, QuizAttemptAnswer } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function getQuizAttemptDetails(req, res) {
    try {
        const user = await getSession(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { quizId, attemptId } = req.params;
        if (!quizId || !attemptId) {
            return res.status(400).json({ success: false, message: 'Quiz ID and Attempt ID are required' });
        }

        // Get attempt with questions and answers
        const attempt = await QuizAttempt.findOne({
            where: { id: attemptId, quiz_id: quizId },
            include: [{
                model: QuizAttemptQuestion,
                include: [QuizAttemptAnswer]
            }]
        });

        if (!attempt) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Transform the data for frontend
        const transformedAttempt = {
            id: attempt.id,
            timeSpent: Math.round((new Date(attempt.completed_at) - new Date(attempt.started_at)) / 1000),
            score: attempt.overall_score,
            totalQuestions: attempt.total_questions,
            overallFeedback: attempt.overall_feedback,
            completed_at: attempt.completed_at,
            questions: attempt.QuizAttemptQuestions.map(q => ({
                id: q.id,
                type: q.question_type,
                prompt: q.prompt,
                order: q.question_order,
                options: q.QuizAttemptAnswers.map(a => ({
                    id: a.id,
                    value: a.answer_value,
                    isCorrect: a.is_correct,
                    wasSelected: a.user_selected,
                    pointsAwarded: a.points_awarded,
                    aiFeedback: a.ai_feedback
                }))
            }))
        };

        res.status(200).json({ 
            success: true, 
            attempt: transformedAttempt
        });

    } catch (error) {
        console.error('Error in getQuizAttemptDetails:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { getQuizAttemptDetails }; 