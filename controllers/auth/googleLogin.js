const { OAuth2Client } = require('google-auth-library');
const googleAuth = require("../../google_auth.json");
const getUserFromEmail = require("../../repositories/getUserFromEmail");
const getUserFromUsername = require("../../repositories/getUserFromUsername");
const { User } = require("../../models");

const client = new OAuth2Client(googleAuth.client_id);

const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
};

const googleLogin  = async (req, res) => {

    const { token } = req.body;
    if(!token) {
        return res.status(500).send({success:false, message: "Invalid token" });
    }

    try {

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: googleAuth.client_id
        });

        const payload = ticket.getPayload();
        
        // Extract relevant information from the payload
        const googleId = payload['sub'];  // This is the Google ID
        let email = payload['email'];
        const name = payload['name'];

        email = email.toLowerCase();

        const nameParts=  name.split(" "); 
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[1] : "";

        let username;
        while(!username) {
            username = name + " " + Math.floor(Math.random() * 1000);
            let existingUsernameUser = await getUserFromUsername(username);
            if(!existingUsernameUser) {
                break;
            } else {
                username = null;
            }
        }

        let userModel = await getUserFromEmail(email);
        if(!userModel) {
            userModel = await User.create({
                firstName,
                lastName,
                username, 
                password: "",
                color: generateRandomColor(),
                email,
                googleId,
                dateCreated: new Date()
            });
        } 
        
        req.session.user = { username: userModel.username };

        console.log(userModel);

        res.status(200).json({
            success: true,
            user: { 
                id: userModel.id,
                firstName: userModel.firstName,
                lastName: userModel.lastName,
                username: userModel.username,
                email: userModel.email,
                color: userModel.color,
                dateCreated: userModel.dateCreated,
                tier: userModel.tier
            }
        });

    } catch (error) {
        console.error('Error verifying Google token:', error);
        res.status(401).json({ 
            success: false,
            message: 'Authentication failed' 
        });
    }

}

module.exports = googleLogin;