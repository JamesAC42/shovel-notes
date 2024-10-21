const { User } = require('../models');

async function getUserDataFromUsername(username) {
  try {
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'firstName', 'lastName', 'dateCreated', 'color', 'username', 'email', 'tier'],
    });

    if (!user) {
      return null;
    }

    let userData = user.toJSON();
    if(!userData.tier) {
      userData.tier = 1;
    }
    
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

module.exports = getUserDataFromUsername;
