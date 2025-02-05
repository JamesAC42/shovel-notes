const { User } = require("../models");
const getUserFromEmail = (email) => {
    return User.findOne({ where: { email } })
        .then(user => {
            if (!user) {
                return null;

            }
            return user;
        })
        .catch(err => {
            console.error('Error retrieving user from the database:', err);
            throw err;
        });
}
module.exports = getUserFromEmail;