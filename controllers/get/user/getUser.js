const getSession = require('../../../utilities/getSession');

async function getUser(req, res) {
  console.log('Full session object:', req.session);
  console.log('Session user:', req.session?.user);
  console.log('Session ID:', req.sessionID);
  
  try {
    const userData = await getSession(req);
    console.log('User data:', userData);
    if (!userData) {
      console.log('No user data returned from getSession');
      return res.json({ success: false, message: 'No active session' });
    }
    res.json({ 
      success: true, 
      userData
    });
  } catch (error) {
    console.error('Error in getUser controller:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = { getUser };