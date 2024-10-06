const express = require('express')
const userRouter = new express.Router()
const userCtrl = require('src/controllers/userCtrl')
const auth = require('src/middleware/auth')
const url = require('src/utils/constants/appConstants')

userRouter.post(url.USERS.LOGIN, userCtrl.login)
userRouter.get(url.USERS.FETCH, auth, userCtrl.fetch)
userRouter.patch(url.USERS.UPDATE, auth, userCtrl.updateUser)
userRouter.post(url.USERS.REGISTER, userCtrl.register)

module.exports = userRouter