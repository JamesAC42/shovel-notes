const bcrypt = require('bcrypt');
const {User} = require('../../models');

async function login(req, res) {
  try {
    const { email, password } = req.body;


    console.log("logging in");
    // Find user
    const user = await User.findOne({
      where: {
        email
      }
    });

    console.log(user);

    if (!user) {
      return res.json({ 

        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    console.log("checking password");
    console.log(password);
    console.log(user.password);
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log("valid password");

    // Set session
    req.session.user = { username: user.username };


    res.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

module.exports = login; 