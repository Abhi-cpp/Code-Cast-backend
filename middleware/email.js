const nodemailer = require('nodemailer')

function transport() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: "abhishek.kumar986871@gmail.com",
            pass: process.env.PW
        },
        host: 'smtp.gmail.com'
    })
}
const transportobj = transport()
const sendwelcomemail = (email, name) => {
    transportobj.sendMail({
        from: 'Code-Editor <abhishek.kumar986871@gmail.com>',
        to: email,
        subject: 'Thanks for joining!',
        text: `Welcome to our service, ${name}!`,
        html: `<b>Welcome to our service, ${name}!</b>`
    })
}

module.exports = sendwelcomemail;