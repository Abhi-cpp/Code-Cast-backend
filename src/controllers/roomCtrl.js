const Room = require('./../DB/schema/room');
const User = require('./../DB/schema/user');

async function createRoom(req, res) {
    try {
        const room = new Room(req.room);
        await room.save();
        const user = await User.findById(req.user.id);
        user.rooms.push(room._id);
        user.save();
        res.status(200).send({ room: room });
    }
    catch (e) {
        console.log('error in createRoom', e);
        res.status(400).send('failed to create room');
    }
}

async function fetch(req, res) {
    try {
        const roomId = (req.query.id);
        const room = await Room.findOne({ roomId });
        if (!room)
            return res.status(404).send();
        room["_doc"].id = room["_doc"]._id;
        delete room["_doc"]._id;
        console.log(room);
        res.status(200).send({ room });
    }
    catch (e) {
        console.log('error in fetch', e);
        res.status(400).send('failed to fetch room details');
    }
}

async function updateRoomInDatabase(req, res) {
    try {
        const roomId = req.body.room.roomId;
        const room = await Room.findOneAndUpdate({
            roomId
        }, {
            name: req.body.room.name || "",
            code: req.body.room.code || "",
            language: req.body.room.language || ""
        }, {
            new: true,
            runValidators: true
        });
        res.status(200).send(room);
    }
    catch (e) {
        console.log('error in updateRoom', e);
        res.status(400).send(e);
    }
}

async function deleteRoom(req, res) {
    try {
        const id = req.body.id;
        const room = await Room.findByIdAndDelete(id);
        if (!room)
            return res.status(404).send();
        res.status(200).send(room);
    }
    catch (e) {
        console.log('error in deleteRoom', e);
        res.status(400).send('failed to delete room');
    }
}

module.exports = {
    createRoom,
    fetch,
    updateRoomInDatabase,
    deleteRoom
};