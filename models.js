const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.STRING(50),
        field: 'first_name',
    },
    lastName: {
        type: DataTypes.STRING(50),
        field: 'last_name',
    },
    dateCreated: {
        type: DataTypes.DATEONLY,
        field: 'date_created',
    },
    color: {
        type: DataTypes.STRING(20),
    },
    password: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    googleId: {
        type: DataTypes.STRING(256),
        allowNull: true,
        field: 'google_id'
    },
    tier: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: 'users',
    timestamps: false,
});


const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
    },
    public: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'room',
    timestamps: false,
});


const RoomUser = sequelize.define('RoomUser', {
    room: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'Room',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        field: 'user_id',
        primaryKey: true,
        references: {
            model: 'User',
            key: 'id',
        },
    },
}, {
    tableName: 'room_users',
    timestamps: false,
});

// Notebook model
const Notebook = sequelize.define('Notebook', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    room_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'notebooks',
    timestamps: false
});

// NotebookPage model
const NotebookPage = sequelize.define('NotebookPage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    notebook_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_edited_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    last_edited_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_folder: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    tableName: 'notebook_pages',
    timestamps: false
});

// Define associations
Notebook.hasMany(NotebookPage, { foreignKey: 'notebook_id' });
NotebookPage.belongsTo(Notebook, { foreignKey: 'notebook_id' });

NotebookPage.hasMany(NotebookPage, { as: 'Children', foreignKey: 'parent_id' });
NotebookPage.belongsTo(NotebookPage, { as: 'Parent', foreignKey: 'parent_id' });

NotebookPage.belongsTo(User, { as: 'lastEditedByUser', foreignKey: 'last_edited_by' });
User.hasMany(NotebookPage, { as: 'editedPages', foreignKey: 'last_edited_by' });

User.hasMany(RoomUser, { foreignKey: "user_id" });
RoomUser.belongsTo(User, { foreignKey: "userId" });
Room.hasMany(RoomUser, { foreignKey: 'room' });
RoomUser.belongsTo(Room, { foreignKey: 'room' });

Room.hasOne(Notebook, { foreignKey: 'room_id' });
Notebook.belongsTo(Room, { foreignKey: 'room_id' });

// Deck model
const Deck = sequelize.define('Deck', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    room: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    last_edited_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notebook: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_edited_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    last_studied_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'decks',
    timestamps: false
});

// Flashcard model
const Flashcard = sequelize.define('Flashcard', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deck: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    front: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    back: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    is_starred: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    is_learned: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'flashcards',
    timestamps: false
});

// Define associations
Deck.belongsTo(Room, { foreignKey: 'room' });
Room.hasMany(Deck, { foreignKey: 'room' });

Deck.belongsTo(Notebook, { foreignKey: 'notebook' });
Notebook.hasMany(Deck, { foreignKey: 'notebook' });

Deck.belongsTo(User, { as: 'lastEditedByUser', foreignKey: 'last_edited_by' });
User.hasMany(Deck, { as: 'editedDecks', foreignKey: 'last_edited_by' });

Flashcard.belongsTo(Deck, { foreignKey: 'deck' });
Deck.hasMany(Flashcard, { foreignKey: 'deck' });

// Quiz model
const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    room: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    last_edited_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notebook: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    last_edited_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    last_studied_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'quizzes',
    timestamps: false
});

// QuizQuestion model
const QuizQuestion = sequelize.define('QuizQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        autoIncrementIdentity: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question_type: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    question_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'quiz_questions',
    timestamps: false
});

// QuizAnswer model
const QuizAnswer = sequelize.define('QuizAnswer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        autoIncrementIdentity: true
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'question_id'
    },
    answer_value: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'answer_value'
    },
    is_correct: {
        type: DataTypes.BOOLEAN,
        field: 'is_correct',
        defaultValue: false
    }
}, {
    tableName: 'quiz_answers',
    timestamps: false
});

// Define associations for Quiz models
Quiz.belongsTo(Room, { foreignKey: 'room' });
Room.hasMany(Quiz, { foreignKey: 'room' });

Quiz.belongsTo(Notebook, { foreignKey: 'notebook' });
Notebook.hasMany(Quiz, { foreignKey: 'notebook' });

Quiz.belongsTo(User, { as: 'lastEditedByUser', foreignKey: 'last_edited_by' });
User.hasMany(Quiz, { as: 'editedQuizzes', foreignKey: 'last_edited_by' });

Quiz.hasMany(QuizQuestion, { foreignKey: 'quiz_id' });
QuizQuestion.belongsTo(Quiz, { foreignKey: 'quiz_id' });

QuizQuestion.hasMany(QuizAnswer, { foreignKey: 'question_id' });
QuizAnswer.belongsTo(QuizQuestion, { foreignKey: 'question_id' });

// QuizAttempt model
const QuizAttempt = sequelize.define('QuizAttempt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    overall_score: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true
    },
    overall_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    total_questions: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'quiz_attempts',
    timestamps: false
});

// QuizAttemptQuestion model
const QuizAttemptQuestion = sequelize.define('QuizAttemptQuestion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    original_question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question_type: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    prompt: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    question_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'quiz_attempt_questions',
    timestamps: false
});

// QuizAttemptAnswer model
const QuizAttemptAnswer = sequelize.define('QuizAttemptAnswer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    attempt_question_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    answer_value: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    ai_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    points_awarded: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: true
    }
}, {
    tableName: 'quiz_attempt_answers',
    timestamps: false
});

// Define associations for quiz attempt models
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quiz_id' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quiz_id' });

QuizAttempt.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(QuizAttempt, { foreignKey: 'user_id' });

QuizAttempt.hasMany(QuizAttemptQuestion, { foreignKey: 'attempt_id' });
QuizAttemptQuestion.belongsTo(QuizAttempt, { foreignKey: 'attempt_id' });

QuizAttemptQuestion.belongsTo(QuizQuestion, { foreignKey: 'original_question_id' });
QuizQuestion.hasMany(QuizAttemptQuestion, { foreignKey: 'original_question_id' });

QuizAttemptQuestion.hasMany(QuizAttemptAnswer, { foreignKey: 'attempt_question_id' });
QuizAttemptAnswer.belongsTo(QuizAttemptQuestion, { foreignKey: 'attempt_question_id' });

// Export models
module.exports = {
    Notebook,
    NotebookPage,
    User,
    Room,
    RoomUser,
    Deck,
    Flashcard,
    Quiz,
    QuizQuestion,
    QuizAnswer,
    QuizAttempt,
    QuizAttemptQuestion,
    QuizAttemptAnswer
};
