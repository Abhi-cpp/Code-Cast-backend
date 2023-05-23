const { createRoom, addRoomUser, removeRoomUser, getRoom, updateRoom, updateRoomIO, deleteUser } = require('../Room/socketRoom');

function mangerRoom(socket, io) {

    const { id: socketId } = socket;

    socket.on('join', async ({ roomName = 'Room X', roomid, name, code = '', language = 'javascript', input = '', output = '', avatar = '' }) => {
        try {
            if (!name) {
                throw new Error('Invalid data');
            }
            createRoom(roomid, roomName, code, language, input, output);

            addRoomUser(roomid, { id: socketId, name, avatar });

            await socket.join(roomid);

            // socket.emit('me', socketId);
            socket.emit('join', { msg: `Welcome to ${roomName}`, room: getRoom(roomid) });

            socket.to(roomid).emit('userJoin', { msg: `New user joined ${name}`, newUser: { id: socketId, name, avatar } });

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('update', ({ roomid, patch }) => {
        try {
            updateRoom(roomid, patch);
            socket.to(roomid).emit('update', { patch });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });



    socket.on('leave', ({ roomid }) => {
        try {
            const name = removeRoomUser(roomid, socketId);
            socket.leave(roomid);
            io.to(roomid).emit('userLeft', { msg: `${name} left the room`, userId: socketId });
            console.log('user left', name);

        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('updateIO', ({ roomid, input, output, language }) => {
        try {
            console.log('updateIO', input, output, language)
            updateRoomIO(roomid, input, output, language);
            socket.to(roomid).emit('updateIO', {
                newinput: input,
                newoutput: output,
                newlanguage: language
            });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })

    socket.on('getRoom', ({ roomid }) => {
        try {
            // emit to everyone in the room
            io.in(roomid).emit('getRoom', { room: getRoom(roomid) });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
        let roomid = deleteUser(socketId);
        if (roomid !== null) {
            const name = removeRoomUser(roomid, socketId);
            socket.leave(roomid);
            io.to(roomid).emit('userLeft', { msg: `${name} left the room`, userId: socketId });
            console.log('user left', name);
        }
    });


    socket.on('Id', ({ roomid, peerId }) => {
        console.log("peerId", peerId)
        socket.to(roomid).emit('Id', { peerId });
    })


    socket.on("drawData", (data) => {
        socket.broadcast.emit("drawData", data);
    });

}

module.exports = mangerRoom;
