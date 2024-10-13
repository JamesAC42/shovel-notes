const getUserDataFromUsername = require('./getUserDataFromUsername');

async function getSession(req) {
  try {
    const username = req.session.user?.username;
    if (!username) {
      return null;
    }
    const userData = await getUserDataFromUsername(username);
    if (!userData) {
      return null;
    }
    return userData;
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

module.exports = getSession;
