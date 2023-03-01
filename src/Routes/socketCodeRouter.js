const { createRoom, deleteRoom, addRoomUser, removeRoomUser, getRoom, handleDisconnect } = require('../controllers/socketRoom');

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


    socket.on('join', async ({ roomName = 'Room X', roomId, name, code = '', language = 'javascript' }) => {

        console.log('join', roomName, roomId, name, code, language);

        try {
            if (!name) {
                throw new Error('Invalid data');
            }

            createRoom(roomId, roomName, code, language);

            if (memberOfRoom(roomId, socketId))
                throw new Error('User is already in the room');


            addRoomUser(roomId, { id: socketId, name });

            await socket.join(roomId);

            socket.emit('greet', { msg: `Welcome to ${roomName}`, room: getRoom(roomId) });

            socket.to(roomId).emit('newJoin', { msg: `New user joined ${name}`, room: getRoom(roomId) });

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

            socket.to(roomId).emit('newData', { room: room });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('leaveRoom', ({ roomId }) => {

        try {
            if (!memberOfRoom(roomId, socketId)) throw new Error('User is not in the room');

            removeRoomUser(roomId, socketId);

            socket.to(roomId).emit('userLeft', { msg: `User left`, room: getRoom(roomId) });

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

        for (let i = 0; i < acknowledge.length; i++) {

            let { name, roomId } = acknowledge[i];

            console.log(acknowledge[i])

            roomId = Number(roomId);

            io.to(roomId).emit('userLeft', { msg: `User left`, name, room: getRoom(roomId) });
        }
    });





    socket.on('getRoom', ({ roomId }) => {
        console.log(socket.rooms)
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
