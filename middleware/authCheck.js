const getSession = require('../utilities/getSession');

async function authCheck(req, res, next) {
  try {
    const userData = await getSession(req);
    if (!userData) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    req.user = userData;
    next();
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = authCheck; 