const express = require('express')
const router = new express.Router()
const User = require('../DB/schema/user')
const auth = require('../middleware/auth')
// login or signup
router.post('/users/login', async (req, res) => {
    console.log("login request ", req.body)
    try {
        const user = await User.findOne({
            email: req.body.email
        })
        if (!user) {
            const user = new User(req.body)
            await user.save()
            const token = await user.generateAuthToken()
            return res.send({ user, token })
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        console.log('login error ', e)
        res.status(400).send()
    }
})

// logout

module.exports = router
