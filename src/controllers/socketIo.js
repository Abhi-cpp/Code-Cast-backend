
const rooms = {};
let connectionCount = 0;

function memberOfRoom(roomId, socketId) {
    // use try catch method to handle errors
    try {
        // check if the room exists
        if (!rooms[roomId]) throw new Error('Room does not exist');

        // if user is in this room then throw error

        console.log(rooms[roomId].users.some(user => user.id === socketId))

        return (rooms[roomId].users.some(user => user.id === socketId))


    } catch (err) {
        console.log(err);
        return false;
    }
}

const socketIo = (io) => {
    io.on('connection', (socket) => {

        connectionCount++;
        console.log(`New connection: ${connectionCount}`);

        // x-y corrdingate array

        socket.on('join', ({ roomName = 'Room X', roomId, name, code = '', language = 'javascript' }) => {
            try {

                //!! deploy here validation checks to make sure correct data  is being sent
                if (!name) throw new Error('Invalid data');


                // if room was not created before, create it
                if (!rooms[roomId]) {
                    rooms[roomId] = {
                        roomName,
                        roomId,
                        users: [],
                        code: code,
                        language: language
                        // xy corarray
                    }
                }

                // check if user is already in the room abd also room exists
                if (memberOfRoom(roomId, socket.id)) throw new Error('User is already in the room');

                // add the user data to  that room object
                const user = { id: socket.id, name };
                rooms[roomId].users.push(user);


                // join the user to the room
                socket.join(roomId);


                // greet the joining user
                socket.emit('greet', { msg: `Welcome to ${roomName}`, room: rooms[roomId] });

                // send to rest of the users in the room that a new user has joined
                socket.to(roomId).emit('newJoin', { msg: `New user joined ${user.name}`, room: rooms[roomId] });

            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });

        // update drawing data
        // when a client sends a message to the server
        //! have to add other data to this event
        socket.on('updateRoom', ({ roomId, code = '', language = '' }) => {
            try { // update the room data

                if (!memberOfRoom(roomId, socket.id)) throw new Error('User is not in the room');

                rooms[roomId].code = code;
                rooms[roomId].language = language;

                // send to all users expect the sender
                socket.to(roomId).emit('newData', { room: rooms[roomId] });
            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });

        // when a user leaves the room
        socket.on('leaveRoom', ({ roomId }) => {
            // remove the user from the room
            try {

                if (!memberOfRoom(roomId, socket.id)) throw new Error('User is not in the room');

                const user = rooms[roomId].users[socket.id]
                rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== socket.id);

                console.log('before leaving', socket.adapter.rooms)

                socket.leave(roomId);

                console.log('after leaving room', socket.adapter.rooms)

                // acknowledge the room that the user left
                io.to(roomId).emit('userLeft', { user, room: rooms[roomId] });

                // if there are no users in the room, delete the room
                if (rooms[roomId].users.length === 0) {
                    delete rooms[roomId];
                }
            } catch (err) {
                console.log(err);
                socket.emit('error', { err });
            }
        });

        // get status of room
        socket.on('get', ({ roomId }) => {
            try {
                if (!memberOfRoom(roomId, socket.id)) throw new Error('User is not in the room');

                socket.emit('roomStatus', { room: rooms });
            } catch (err) {
                console.log(err);
                socket.emit('error', { error: err });
            }
        });






        // when a user disconnects
        //! a users may abruptly disconnect, so we need to handle that
        socket.on('disconnect', () => {


            // check if the user was in a room
            // user could be present only in one room at a time
            for (let room in rooms) {
                if (rooms[room].users.some(user => user.id === socket.id)) {


                    const user = rooms[room].users[socket.id]

                    // remove the user from the room
                    rooms[room].users = rooms[room].users.filter(user => user.id !== socket.id);

                    socket.leave(room);

                    // acknowledge the room that the user left
                    io.to(room).emit('userLeft', { user, room: rooms[room] });

                    // if there are no users in the room, delete the room
                    if (rooms[room].users.length === 0) {
                        delete rooms[room];
                    }
                }
            }

            connectionCount--;
            console.log(`A user disconnected. Number of connections: ${connectionCount}`);
        });
    });
};


module.exports = socketIo;