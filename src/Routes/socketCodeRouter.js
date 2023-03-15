const { createRoom, addRoomUser, removeRoomUser, getRoom, updateRoom, updateRoomIO } = require('../Room/socketRoom');


function mangerRoom(socket, io) {

    const { id: socketId } = socket;

    socket.on('join', async ({ token, roomName = 'Room X', roomid, name, code = '', language = 'javascript', input = '', output = '' }) => {
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

    socket.on('updateIO', ({ roomid, inputPath, outputPatch }) => {
        try {
            updateRoomIO(roomid, inputPath, outputPatch);
            socket.to(roomid).emit('updateIO', { inputPath, outputPatch });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })


}

module.exports = mangerRoom;
