const mangeRoom = require('./Routes/socketCodeRouter');

let connectionCount = 0;

const initSocketIO = (io) => {

    io.on('connection', (socket) => {

        ++connectionCount;
        console.log(`A user connected. Total connections: ${connectionCount}`);

        mangeRoom(socket, io);

        socket.on('disconnect', () => {

            --connectionCount;
            console.log(`A user disconnected. Total connections: ${connectionCount}`);

        });
    });

};

module.exports = initSocketIO;
