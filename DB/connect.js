const mongoose = require('mongoose');
require('dotenv').config()

const url = 'mongodb+srv://pizza-shop:' + process.env.dbpw + '@cluster0.mlzimeo.mongodb.net/code-editor?retryWrites=true&w=majority';
const DBConnect = async () => {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (err) {
        process.exit(1);
    }
}

module.exports = DBConnect;

