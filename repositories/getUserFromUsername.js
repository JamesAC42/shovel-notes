const { User } = require("../models");

const getUserFromUsername = (username) => {
    return User.findOne({ where: { username: username } })
        .then(user => {
            if (!user) {

                return null;
            }
            return {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                dateCreated: user.dateCreated,
                color: user.color,
                username: user.username,
                tier: user.tier
            };
        })
        .catch(err => {
            console.error('Error retrieving user from the database:', err);
            throw err;
        });
}
module.exports = getUserFromUsername;