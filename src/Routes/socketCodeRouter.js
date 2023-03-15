const { createRoom, addRoomUser, removeRoomUser, getRoom, updateRoom, updateRoomIO } = require('../Room/socketRoom');


function mangerRoom(socket, io) {

    const { id: socketId } = socket;

    socket.on('join', async ({ roomName = 'Room X', roomid, name, code = '', language = 'javascript', input = '', output = '' }) => {
        try {
            if (!name) {
                throw new Error('Invalid data');
            }
            createRoom(roomid, roomName, code, language, input, output);

            addRoomUser(roomid, { id: socketId, name });

            await socket.join(roomid);

            socket.emit('join', { msg: `Welcome to ${roomName}`, room: getRoom(roomid) });

            socket.to(roomid).emit('userJoin', { msg: `New user joined ${name}` });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('update', ({ roomid, patch, language = '' }) => {
        try {
            updateRoom(roomid, patch, language);
            socket.to(roomid).emit('update', { patch, language });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('leave', ({ roomid }) => {
        try {
            const name = removeRoomUser(roomid, socketId);
            socket.leave(roomid);
            io.to(roomid).emit('userLeft', { name });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('updateIO', ({ roomid, input, output, language }) => {
        try {
            console.log('updateIO', input, output, language)
            updateRoomIO(roomid, input, output, language);
            socket.to(roomid).emit('updateIO', { input, output, language });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })


}

module.exports = mangerRoom;
