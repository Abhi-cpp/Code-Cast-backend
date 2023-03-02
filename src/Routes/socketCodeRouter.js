const socketAuth = require('../middleware/socketAuth');
const { createRoom, deleteRoom, addRoomUser, removeRoomUser, getRoom, handleDisconnect } = require('../Room/socketRoom');

function memberOfRoom(roomId, socketId) {
    // use try catch method to handle errors
    try {
        // check if the room exists
        if (!getRoom(roomId)) throw new Error('Room does not exist');

        // if user is in this room then throw error

        return (getRoom(roomId).users.some(user => user.id === socketId));

    } catch (err) {
        console.log(err);
        return false;
    }
}


function mangerRoom(socket, io) {

    const { id: socketId } = socket;


    socket.on('join', async ({ token, roomName = 'Room X', roomId, name, code = '', language = 'javascript' }) => {

        console.log('join', roomName, roomId, name, code, language);

        try {
            if (!name) {
                throw new Error('Invalid data');
            }

            socketAuth(token);

            createRoom(roomId, roomName, code, language);

            if (memberOfRoom(roomId, socketId))
                throw new Error('User is already in the room');


            addRoomUser(roomId, { id: socketId, name });

            await socket.join(roomId);

            socket.emit('greet', { msg: `Welcome to ${roomName}`, room: getRoom(roomId) });

            socket.to(roomId).emit('userJoin', { msg: `New user joined ${name}`, room: getRoom(roomId) });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });

        }
    });



    socket.on('updateRoom', ({ roomId, code = '', language = '' }) => {
        try {
            if (!memberOfRoom(roomId, socketId)) throw new Error('User is not in the room');

            const room = getRoom(roomId);
            room.code = code;
            room.language = language;

            socket.to(roomId).emit('update', { room: room });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('leaveRoom', ({ roomId }) => {

        try {
            if (!memberOfRoom(roomId, socketId)) throw new Error('User is not in the room');

            const name = removeRoomUser(roomId, socketId);
            // emit user left msg with name of the user and room data
            io.to(roomId).emit('userLeft', { name, room: getRoom(roomId) });

            socket.leave(roomId);

            if (getRoom(roomId).users.length === 0) {
                deleteRoom(roomId);
            }

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    // write a code to handle disconnect event
    socket.on('disconnect', async () => {

        // go through all the rooms and remove the user from the room
        let acknowledge = handleDisconnect(socketId);

        for (const element of acknowledge) {

            let { name, roomId } = element;

            roomId = Number(roomId);

            io.to(roomId).emit('userLeft', { name, room: getRoom(roomId) });
        }
    });





    socket.on('getRoom', ({ roomId }) => {
        try {
            if (!memberOfRoom(roomId, socketId)) throw new Error('User is not in the room');

            socket.emit('roomData', { room: getRoom(roomId) });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

}

module.exports = mangerRoom;
