const Room = require('./../DB/schema/room')
const User = require('./../DB/schema/user')

async function createRoom(req, res) {
    try {
        const room = new Room(req.room)
        await room.save()
        const user = await User.findById(req.user._id)
        user.rooms.push(room._id)
        user.save()
        console.log('final call room', room)
        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in createRoom', e)
        res.status(400).send('failed to create room')
    }
}

async function fetch(req, res) {
    try {
        const _id = (req.query.id);
        const room = await Room.findById(_id)
        if (!room)
            return res.status(404).send();
        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in fetch', e)
        res.status(400).send('failed to fetch room details')
    }
}

async function updateRoom(req, res) {
    try {
        const _id = req.body.room._id;
        const room = await Room.findByIdAndUpdate(_id, {
            $set: req.body.room
        }, { new: true, runValidators: true })
        console.log('room data after update', room);
        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in updateRoom', e)
        res.status(400).send(e)
    }
}

async function deleteRoom(req, res) {
    try {
        const _id = req.body.id;
        const room = await Room.findByIdAndDelete(_id)
        if (!room)
            return res.status(404).send();
        res.status(200).send(room)
    }
    catch (e) {
        console.log('error in deleteRoom', e)
        res.status(400).send('failed to delete room')
    }
}

module.exports = {
    createRoom,
    fetch,
    updateRoom,
    deleteRoom
}