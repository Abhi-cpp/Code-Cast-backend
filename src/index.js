const express = require('express');
const DBConnect = require('./DB/connect');
const userRouter = require('./Routes/userRoutes')
const roomRouter = require('./Routes/roomRoutes')
const codeRouter = require('./Routes/codeRoutes');
const socketIO = require('./controllers/socketIo')
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 1234;


const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

// how to send io to socketIo.js
socketIO(io);


app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(roomRouter);
app.use(codeRouter)


DBConnect().then(() => {
    console.log("DB connected");
    httpServer.listen(port, () => {
        console.log('Server started on port: ' + port);
    })
});
app.use('/', (req, res) => {
    res.send("server is up and running. ")
})