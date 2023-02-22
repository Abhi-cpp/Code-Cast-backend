const express = require('express');
const app = express();
const DBConnect = require('./DB/connect');
require('dotenv').config()
const port = process.env.PORT || 1234;
const userRouter = require('./Routes/userRoutes')
var cors = require('cors');
app.use(cors());


app.use(express.json());
app.use(userRouter);



DBConnect().then(() => {
    console.log("DB connected");
    app.listen(port, () => {
        console.log('Server started on port: ' + port);
    })
});
