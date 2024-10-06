const User = require('src/DB/schema/user');
const { OAuth2Client } = require('google-auth-library');
const sendwelcomemail = require('src/middleware/email');

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
    });
}
// signup or signin
async function login(req, res) {
    console.log("login request");
    try {
        // token h the do this else do that
        if (req.body.clientId) {
            const payload = await verify(req.body);
            console.log(payload);
            let user = await User.findOne({ email: payload.email });
            // it's a new user
            if (user == null) {
                user = new User(payload);
                //! has to disable as google is blocking my gmail login
                sendwelcomemail(user.email, user.name);
                await user.save();
            }
            else
                await user.populate('rooms', 'name roomId language timestamps updatedAt');
            const token = await user.generateAuthToken();
            user.id = user._id;
            delete user._id;
            res.status(200).send({ user, token });
        }
        else {
            const tmp = req.body;
            const user = await User.findByCredentials(tmp.email, tmp.password);
            await user.populate('rooms', 'name roomId language timestamps updatedAt');
            const token = await user.generateAuthToken();
            console.log('succesfully done');
            user.id = user._id;
            delete user._id;
            res.status(200).send({ user, token });
        }
    }
    catch (e) {
        console.log('erro at login', e);
        res.status(400).send();
    }
}

// register user
async function register(req, res) {
    console.log("register request");

    try {
        // check if the email is already registered
        const already = await User.findOne({ email: req.body.email });
        if (already) throw new Error('Already');

        // create new user
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        user.id = user._id;
        delete user._id;
        res.status(200).send({ user, token });
    }
    catch (e) {
        // if (e.includes('Already'))
        res.status(400).send({ error: e.message });

    }
}

// @#! doubt
// giving user back it's data after jwt verification
async function fetch(req, res) {
    try {
        await req.user.populate('rooms', 'name roomId language timestamps updatedAt');
        res.status(200).send({ user: req.user, token: req.token });
    }
    catch (e) {
        console.log('error at fetch user', e);
        res.status(500).send();
    }

}

// update users data
async function updateUser(req, res) {
    try {
        req.body.user._id = req.body.user.id;
        delete req.body.user.id;
        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: req.body.user
        }, { new: true, runValidators: true });
        user.id = user._id;
        delete user._id;
        res.status(200).send(user);
    }
    catch (e) {
        console.log('error at update user', e);
        res.status(500).send();
    }
}






module.exports = {
    login,
    fetch,
    updateUser,
    register
};
