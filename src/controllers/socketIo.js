
const rooms = {};
let connectionCount = 0;

const socketIo = (io) => {
    io.on('connection', (socket) => {

        connectionCount++;
        console.log(`New connection: ${connectionCount}`);

        socket.on('join', ({ roomName = 'Room X', roomId, name, code = '', language = '' }) => {

            try {

                //!! deploy here validation checks to make sure correct data  is being sent
                if (!roomId || !name) throw new Error('Invalid data');


                // if room was not created before, create it
                if (!rooms[roomId]) {
                    rooms[roomId] = {
                        roomName,
                        roomId,
                        users: [],
                        code: code,
                        language: language
                    }
                }

                // add the user data to  that room object
                const user = { id: socket.id, name };
                rooms[roomId].users.push(user);


                // join the user to the room
                socket.join(roomId);


                // send the room data to all users in that room
                socket.emit('roomData', { room: rooms[roomId] });
            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });

        // when a client sends a message to the server
        //! have to add other data to this event
        socket.on('updateRoom', ({ roomId, code = '', language = '' }) => {

            try { // update the room data

                if (!roomId) throw new Error('Invalid data');

                rooms[roomId].code = code;
                rooms[roomId].language = language;

                // send to all users expect the sender
                socket.to(roomId).emit('roomData', { room: rooms[roomId] });
            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });

        // when a user leaves the room
        socket.on('leaveRoom', ({ roomId }) => {
            // remove the user from the room
            try {

                if (!roomId) throw new Error('Invalid data');

                const user = rooms[roomId].users[socket.id]
                rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);

                // acknowledge the room that the user left
                io.to(roomId).emit('userLeft', { user, room: rooms[roomId] });

                // if there are no users in the room, delete the room
                if (rooms[roomId].users.length === 0) {
                    delete rooms[roomId];
                }
            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });



        // when a user disconnects
        //! a users may abruptly disconnect, so we need to handle that
        socket.on('disconnect', () => {

            connectionCount--;
            console.log(`A user disconnected. Number of connections: ${connectionCount}`);

            // check if the user was in a room
            // user could be present only in one room at a time
            for (let room in rooms) {
                if (rooms[room].users.some(user => user.id === socket.id)) {


                    const user = rooms[room].users[socket.id]

                    // remove the user from the room
                    rooms[room].users = rooms[room].users.filter(user => user.id !== socket.id);

                    // acknowledge the room that the user left
                    io.to(room).emit('userLeft', { user, room: rooms[room] });

                    // if there are no users in the room, delete the room
                    if (rooms[room].users.length === 0) {
                        delete rooms[room];
                    }
                }
            }

        });
    });
};


module.exports = {
    socketIo,
    connectionCount
}