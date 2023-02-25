const express = require('express')
const router = new express.Router()
const User = require('./../DB/schema/user')
const { OAuth2Client } = require('google-auth-library');
const sendwelcomemail = require('./../middleware/email')
const auth = require("./../middleware/auth")

// google auth2
const verify = async function (body) {
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
router.post('/users/login', async (req, res) => {
    try {
        const payload = await verify(req.body);
        let user = await User.findOne({ email: payload.email })
        if (user.length === 0) {
            user = new User(payload)
            sendwelcomemail(user.email, user.name)
            await user.save()
        }
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    }
    catch (e) {
        console.log(e)
        res.status(400).send()
    }
})

// jwt check
router.get('/users/jwt', auth, async (req, res) => {
    res.send({
        'user': req.user,
        'token': req.token
    })
})

router.post('/code', async (req, res) => {
    console.log(req.body)
    res.send("Thx for sending data")
})



module.exports = router
