const { createRoom, addRoomUser, removeRoomUser, getRoom, updateRoomCode, updateCodeEditorCredentials, deleteUser, updateUserSocketMap, userSocketMap } = require('../Room/socketRoom');

function manageRoom(socket, io) {

    const { id: socketId } = socket;

    socket.on('join', async ({ roomName = 'Room X', roomId, name, email, code = '', language = 'javascript', input = '', output = '', avatar = '' }) => {
        try {
            console.log("new user joined");
            if (!name) {
                throw new Error('Invalid data');
            }
            createRoom(roomId, roomName, code, language, input, output);

            addRoomUser(roomId, { id: socketId, name, avatar });

            await socket.join(roomId);

            socket.emit('join', { msg: `Welcome to ${roomName}`, room: getRoom(roomId), socketId });
            socket.to(roomId).emit('userJoin', { msg: `New user joined ${name}`, newUser: { id: socketId, name, avatar, email } });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('update', ({ roomId, patch }) => {
        try {
            updateRoomCode(roomId, patch);
            socket.to(roomId).emit('update', { patch });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('leave', ({ roomId }) => {
        try {
            const name = removeRoomUser(roomId, socketId);
            socket.leave(roomId);
            io.to(roomId).emit('userLeft', { msg: `${name} left the room`, userLeft: { id: socketId, name, avatar: '', email: "" } });
            console.log('user left', name);
            socket.to(roomId).emit('user left video call', { msg: `${name} left the room`, userId: socketId });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('updateIO', ({ roomId, input, output, language }) => {
        try {
            updateCodeEditorCredentials(roomId, input, output, language);
            socket.to(roomId).emit('updateIO', {
                newinput: input,
                newoutput: output,
                newlanguage: language
            });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('getRoom', ({ roomId }) => {
        try {
            io.in(roomId).emit('getRoom', { room: getRoom(roomId) });
        } catch (err) {
            console.log(err);
            socket.emit('error', { error: err });
        }
    });

    socket.on('disconnect', () => {
        for (let [key, value] of userSocketMap.entries()) {
            if (value === socketId) {
                userSocketMap.delete(key);
                break;
            }
        }
        let roomId = deleteUser(socketId);
        if (roomId !== null) {
            const name = removeRoomUser(roomId, socketId);
            socket.leave(roomId);
            io.to(roomId).emit('userLeft', { msg: `${name} left the room`, userLeft: { id: socketId, name, avatar: "", email: "" } });
            console.log('user left', name);
            socket.to(roomId).emit('user left video call', { msg: `${name} left the room`, userId: socketId });
        }
    });


    socket.on("drawData", (data) => {
        socket.to(data.roomId).emit("drawData", data);
    });

    socket.on("start-video", ({ roomId }) => {
        let allUsers = getRoom(roomId).users;
        allUsers = allUsers.filter(user => user.id !== socketId);
        socket.emit('allUsers', allUsers);
    });

    socket.on("sending video signal", (data) => {
        socket.to(data.userToSignal).emit("new video user joined", { signal: data.signal, callerID: data.callerID, userSending: data.userSending });
    });

    socket.on("returning video signal from receiver", (data) => {
        socket.to(data.callerID).emit("sender receiving final signal", { signal: data.signal, id: socketId });
    });

    socket.on("toggle-video", (data) => {
        socket.broadcast.to(data.roomId).emit("toggle-video", { userId: data.userId });
    });

    socket.on("toggle-audio", (data) => {
        socket.broadcast.to(data.roomId).emit("toggle-audio", { userId: data.userId });
    });

    socket.on("map socket", ({ userId }) => {
        userSocketMap.set(userId, socketId);
    });

    socket.on("join permission", ({ room, user }) => {
        let owner = userSocketMap.get(room.owner);
        console.log(socketId);
        io.to(owner).emit("join permission", { room, user, senderID: socketId });
    });

    socket.on("accept permission", ({ senderID }) => {
        io.to(senderID).emit("permission accepted");
    });

    socket.on("reject permission", ({ senderID }) => {
        io.to(senderID).emit("permission rejected");
    });

}

module.exports = manageRoom;
