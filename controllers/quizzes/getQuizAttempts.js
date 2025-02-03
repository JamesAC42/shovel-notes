const { QuizAttempt, QuizAttemptQuestion, QuizAttemptAnswer, Quiz } = require('../../models');
const getSession = require('../../utilities/getSession');
const userInRoom = require('../../utilities/userInRoom');

async function getQuizAttempts(req, res) {
    try {
        const user = await getSession(req);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const { quizId } = req.params;
        if (!quizId) {
            return res.status(400).json({ success: false, message: 'Quiz ID is required' });
        }

        // Get quiz and validate user access
        const quiz = await Quiz.findByPk(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const isUserInRoom = await userInRoom(user.id, quiz.room);
        if (!isUserInRoom) {
            return res.status(403).json({ success: false, message: 'User not authorized to view these attempts' });
        }

        // Get all attempts for this quiz
        const attempts = await QuizAttempt.findAll({
            where: { quiz_id: quizId },
            order: [['completed_at', 'DESC']],
            attributes: [
                'id',
                'started_at',
                'completed_at',
                'overall_score',
                'total_questions'
            ]
        });

        // Transform the data for the frontend
        const transformedAttempts = attempts.map(attempt => {
            const completedDate = new Date(attempt.completed_at);
            return {
                id: attempt.id,
                created_at: completedDate.toISOString(),
                score: attempt.overall_score,
                total_questions: attempt.total_questions,
                time_taken: Math.round((new Date(attempt.completed_at) - new Date(attempt.started_at)) / 1000),
                correct_answers: Math.round((attempt.overall_score * attempt.total_questions) / 100),
                incorrect_answers: attempt.total_questions - Math.round((attempt.overall_score * attempt.total_questions) / 100)
            };
        });

        res.status(200).json({ 
            success: true, 
            attempts: transformedAttempts
        });

    } catch (error) {
        console.error('Error in getQuizAttempts:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { getQuizAttempts }; 