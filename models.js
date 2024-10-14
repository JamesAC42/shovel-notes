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

Notebook.belongsTo(Room, { foreignKey: 'room_id' });

// Export models
module.exports = {
    Notebook,
    NotebookPage,
    User,
    Room,
    RoomUser
};