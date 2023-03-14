const mangeRoom = require('./Routes/socketCodeRouter');


const initSocketIO = (io, connection) => {

    io.on('connection', (socket) => {

        ++connection.count;
        connection.user.push(socket.id);
        console.log(`A user connected. Total connections: ${connection.count}`);

        mangeRoom(socket, io);

        socket.on('disconnect', () => {

            --connection.Count;
            connection.user = connection.user.filter((user) => user !== socket.id);
            console.log(`A user disconnected. Total connections: ${connection.count}`);

        });
    });

};

module.exports = initSocketIO;
