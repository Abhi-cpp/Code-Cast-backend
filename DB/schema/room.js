const mongoose = require('mongoose');


const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    roomid: {
        type: String,
        required: true,
        trim: true,
    }
    //* iske baad webRTC, edtitor data ayega
}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);