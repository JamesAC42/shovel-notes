const { User } = require('../models');

async function getUserDataFromID(userId) {
  try {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'firstName', 'lastName', 'dateCreated', 'color', 'username', 'email', 'tier'],
    });

    if (!user) {
      return null;
    }

    return user.toJSON();
  } catch (error) {
    console.error('Error fetching user data by ID:', error);
    throw error;
  }
}

module.exports = getUserDataFromID;
