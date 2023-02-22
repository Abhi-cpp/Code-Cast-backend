const jwt = require('jsonwebtoken')
const User = require("../DB/schema/user")

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.token = User.generateAuthToken()
        req.user = user
        next()
    }
    catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = auth