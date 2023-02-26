const express = require('express')
const codeRouter = new express.Router()
const url = require('./../utils/constants/appConstants')
const auth = require('./../middleware/auth')
const validateCode = require('./../vali')
const codeCtrl = require('./../controllers/codeCtrl')


codeRouter.post(url.CODE.EXECUTE, auth, validateCode, codeCtrl.execute)

module.exports = codeRouter