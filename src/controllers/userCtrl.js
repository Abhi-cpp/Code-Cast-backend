const User = require('./../DB/schema/user')
const { OAuth2Client } = require('google-auth-library');
const sendwelcomemail = require('./../middleware/email')

// google auth2
async function verify(body) {
    const client = new OAuth2Client(body.clientId);
    const ticket = await client.verifyIdToken({
        idToken: body.credential,
        audience: body.clientId
    });
    const payload = ticket.getPayload();
    return ({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture
    })
}
// signup or signin
async function login(req, res) {
    try {
        const payload = await verify(req.body);
        let user = await User.findOne({ email: payload.email })
        // it's a new user
        if (user == null) {
            user = new User(payload)
            //! has to disable as google is blocking my gmail login
            sendwelcomemail(user.email, user.name)
            await user.save()
        }
        else
            await user.populate('rooms', 'name roomid language timestamps updatedAt')
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    }
    catch (e) {
        console.log('erro at login', e)
        res.status(400).send()
    }
}

// giving user back it's data after jwt verification
async function fetch(req, res) {
    try {
        await req.user.populate('rooms', 'name roomid language timestamps updatedAt')
        res.status(200).send({ user: req.user, token: req.token })
    }
    catch (e) {
        console.log('error at fetch user', e)
        res.status(500).send()
    }

}

// update users data
async function updateUser(req, res) {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: req.body.user
        }, { new: true, runValidators: true })

        res.status(200).send(user)
    }
    catch (e) {
        console.log('error at update user', e)
        res.status(500).send()
    }
}

// delete user
async function deleteUser(req, res) {
    try {
        await req.user.remove()
        res.status(200).send('User deleted successfully')
    }
    catch (e) {
        console.log('error at delete user', e)
        res.status(500).send()
    }
}




module.exports = {
    login,
    fetch,
    deleteUser,
    updateUser
}
