const rooms = {};

function createRoom(roomId, roomName, code, language) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            roomName,
            roomId,
            users: [],
            code,
            language
        }
    }
}

function deleteRoom(roomId) {
    if (rooms[roomId]) {
        delete rooms[roomId];
    }
}

function addRoomUser(roomId, user) {
    if (rooms[roomId]) {
        rooms[roomId].users.push(user);
    }
}

function removeRoomUser(roomId, userId) {
    if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(user => user.id !== userId);
        if (rooms[roomId].users.length === 0) {
            deleteRoom(roomId);
        }
    }
}

function getRoom(roomId) {
    return rooms[roomId];
}

//! we may have to wrie one more function to handle disconnects
function handleDisconnect(socketId) {
    // go through all the rooms and remove the user from the room and delete the room if there are no users
    // we need to store the user name and roomId so that we can send the message to the room
    let toacknowledge = [];
    for (let roomId in rooms) {
        rooms[roomId].users = rooms[roomId].users.filter(user => {
            if (user.id === socketId) {
                toacknowledge.push({ roomId, name: user.name });
                return false;
            }
            return true;
        });
        if (rooms[roomId].users.length === 0) {
            deleteRoom(roomId);

        }
    }
    return toacknowledge;

}

module.exports = {
    createRoom,
    deleteRoom,
    addRoomUser,
    removeRoomUser,
    getRoom,
    handleDisconnect
};
