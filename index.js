const express = require('express');
const DBConnect = require('./DB/connect');
require('dotenv').config()
const port = process.env.PORT || 1234;
const userRouter = require('./Routes/userRoutes')
const codeRouter = require('./Routes/codeRouter')
var cors = require('cors');
const { createServer } = require("http");
const { Server } = require("socket.io");


const app = express();
const httpServer = createServer(app);


const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

let connections = 0;
const onConnection = (socket) => {
    console.log("New client connected");
    ++connections;
    codeRouter(io, socket, connections)
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        --connections;
    });
};

io.on("connect", onConnection);

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use('/', (req, res) => {
    res.send("server is up and running")
})


DBConnect().then(() => {
    console.log("DB connected");
    httpServer.listen(port, () => {
        console.log('Server started on port: ' + port);
    })
});