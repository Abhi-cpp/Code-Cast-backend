const socketAuth = require('../middleware/socketAuth');
const { createRoom, deleteRoom, addRoomUser, removeRoomUser, getRoom, handleDisconnect } = require('../Room/socketRoom');

function memberOfRoom(roomid, socketId) {
    // use try catch method to handle errors
    try {
        // check if the room exists
        if (!getRoom(roomid)) throw new Error('Room does not exist');

        // if user is in this room then throw error

        return (getRoom(roomid).users.some(user => user.id === socketId));

    } catch (err) {
        console.log(err);
        return false;
    }
}


function mangerRoom(socket, io) {

    const { id: socketId } = socket;


    socket.on('join', async ({ token, roomName = 'Room X', roomid, name, code = '', language = 'javascript' }) => {

        try {
            if (!name) {
                throw new Error('Invalid data');
            }

            socketAuth(token);

            createRoom(roomid, roomName, code, language);

            if (memberOfRoom(roomid, socketId))
                throw new Error('User is already in the room');

            addRoomUser(roomid, { id: socketId, name });

            await socket.join(roomid);

            socket.emit('greet', { msg: `Welcome to ${roomName}`, room: getRoom(roomid) });

            socket.to(roomid).emit('userJoin', { msg: `New user joined ${name}` });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });

        }
    });



    socket.on('updateRoom', ({ roomid, code = '', language = '' }) => {
        try {
            if (!memberOfRoom(roomid, socketId)) throw new Error('User is not in the room');
            const room = getRoom(roomid);
            room.code = code;
            room.language = language;
            socket.to(roomid).emit('update', { room: room });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('leaveRoom', ({ roomid }) => {

        try {
            if (!memberOfRoom(roomid, socketId)) throw new Error('User is not in the room');

            const name = removeRoomUser(roomid, socketId);
            // emit user left msg with name of the user and room data

            socket.leave(roomid);

            io.to(roomid).emit('userLeft', { name });
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

            let { name, roomid } = element;

            roomid = Number(roomid);

            io.to(roomid).emit('userLeft', { name });
        }
    });




}

module.exports = mangerRoom;
