const diff = require('diff-match-patch');
const dmp = new diff.diff_match_patch();
let rooms = {};
const userSocketMap = new Map();


function createRoom(roomId, roomName, code, language, input, output) {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            roomName,
            roomId,
            users: [],
            code,
            language,
            input,
            output
        }
    }
}

function deleteRoom(roomId) {
    console.log('dateleting room', roomId)
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
    let userName;
    if (rooms[roomId]) {
        rooms[roomId].users = rooms[roomId].users.filter(user => {
            if (user.id === userId) {
                userName = user.name;
                return false;
            }
            return true;
        });
    }
    if (rooms[roomId].users.length === 0)
        deleteRoom(roomId);
    return userName;
}

function getRoom(roomId) {
    return rooms[roomId] ? rooms[roomId] : null;
}

function updateRoomCode(roomId, patch) {
    if (rooms[roomId]) {
        try {
            const code = rooms[roomId].code;
            const [newCode, result] = dmp.patch_apply(patch, code);
            if (result[0])
                rooms[roomId].code = newCode;
            else
                console.log('patch failed');
        }
        catch (e) {
            console.log('update failed', e);
        }
    }
}

function updateCodeEditorCredentials(roomId, input = '', output = '', language = '') {
    if (rooms[roomId]) {
        console.log('update code editor credentials', input, output, language);
        try {
            rooms[roomId].input = input;
            rooms[roomId].output = output;
            rooms[roomId].language = language;
        } catch (e) { console.log(e) }

        console.log('after update', rooms[roomId])
    }
}

function deleteUser(userId) {
    for (let roomId in rooms) {
        for (let user in rooms[roomId].users) {
            if (rooms[roomId].users[user].id === userId) {
                return roomId;
            }
        }
    }
    return null;
}

function updateUserSocketMap(userId, socketId) {
    userSocketMap.set(userId, socketId);
}

module.exports = {
    createRoom,
    addRoomUser,
    removeRoomUser,
    getRoom,
    updateRoomCode,
    updateCodeEditorCredentials,
    deleteUser,
    updateUserSocketMap,
    userSocketMap
};
