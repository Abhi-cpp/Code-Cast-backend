const diff = require('diff-match-patch');
const dmp = new diff.diff_match_patch();
const rooms = {};

function createRoom(roomid, roomName, code, language, input, output) {
    if (!rooms[roomid]) {
        console.log("room created", roomid);
        rooms[roomid] = {
            roomName,
            roomid,
            users: [],
            code,
            language,
            input,
            output
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

function updateRoom(roomid, patch, language) {
    if (rooms[roomid]) {
        try {
            // output each element of the patch with a + or - to indicate whether it is an addition or deletion
            const code = rooms[roomid].code;
            const [newCode] = dmp.patch_apply(patch, code);
            // console.log('old code\n', code, '\nNew Code\n', newCode)
            rooms[roomid].code = newCode;
            rooms[roomid].language = language;
        }
        catch (e) {
            console.log('updare failed', e);
        }
    }
}

function updateRoomIO(roomid, inputPath, outputPatch) {
    if (rooms[roomid]) {
        rooms[roomid].input = diff.patch_apply(outputPatch, rooms[roomid].input);
        rooms[roomid].output = diff.patch_apply(outputPatch, rooms[roomid].output);
    }
}


module.exports = {
    createRoom,
    addRoomUser,
    removeRoomUser,
    getRoom,
    updateRoom,
    updateRoomIO,
};
