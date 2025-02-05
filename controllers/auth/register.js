const bcrypt = require('bcrypt');
const {User} = require('../../models');

async function register(req, res) {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Generate username
    let username;
    let attempts = 0;
    const maxAttempts = 10;

    while (!username && attempts < maxAttempts) {
      const randomNum = Math.floor(Math.random() * 100);
      const tempUsername = `${firstName}${lastName}${randomNum}`.toLowerCase().replace(/\s+/g, '');
      
      // Check if username exists
      const existingUsername = await User.findOne({
        where: {
          username: tempUsername
        }
      });

      if (!existingUsername) {
        username = tempUsername;
      }
      attempts++;
    }

    if (!username) {
      return res.json({
        success: false,
        message: 'Unable to generate unique username'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
      dateCreated: new Date(),
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });

    // Set session
    req.session.user = { username: user.username };

    res.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

module.exports = register; 