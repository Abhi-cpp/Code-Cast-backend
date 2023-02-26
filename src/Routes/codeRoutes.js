const express = require('express')
const codeRouter = new express.Router()
const url = require('./../utils/constants/appConstants')
const auth = require('./../middleware/auth')
const validateCode = require('./../validator/validateCode')
const codeCtrl = require('./../controllers/codeCtrl')

//! expectiong req.body to have {code: 'code to be executed', language: 'language of the code'}
codeRouter.post(url.CODE.EXECUTE, auth, validateCode, codeCtrl.execute)

module.exports = codeRouter