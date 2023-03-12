const rooms = {};


function createRoom(roomid, roomName, code, language) {
    if (!rooms[roomid]) {
        rooms[roomid] = {
            roomName,
            roomid,
            users: [],
            code,
            language
        }
    }
}

function deleteRoom(roomid) {
    if (rooms[roomid]) {
        delete rooms[roomid];
    }
}

function addRoomUser(roomid, user) {
    if (rooms[roomid]) {
        rooms[roomid].users.push(user);
    }
}

function removeRoomUser(roomid, userId) {
    let userName;
    if (rooms[roomid]) {
        rooms[roomid].users = rooms[roomid].users.filter(user => {
            if (user.id === userId) {
                userName = user.name;
                return false;
            }
            return true;
        });
    }
    return userName;
}

function getRoom(roomid) {
    return rooms[roomid] ? rooms[roomid] : null;
}

function handleDisconnect(socketId) {
    // go through all the rooms and remove the user from the room and delete the room if there are no users
    // we need to store the user name and roomid so that we can send the userleft message to the rooms
    let toacknowledge = [];
    for (let roomid in rooms) {
        rooms[roomid].users = rooms[roomid].users.filter(user => {
            if (user.id === socketId) {
                toacknowledge.push({ roomid, name: user.name });
                return false;
            }
            return true;
        });
        if (rooms[roomid].users.length === 0) {
            deleteRoom(roomid);

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
