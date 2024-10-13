const getSession = require('../../../utilities/getSession');

async function getUser(req, res) {
  try {
    const userData = await getSession(req);
    if (!userData) {
      return res.status(401).json({ success: false, message: 'Invalid session' });
    }
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error in getUser controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getUser };