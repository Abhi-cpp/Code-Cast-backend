const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomSchema = new Schema({
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
        immutable: true
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        require: true,
        default: 'javascript'
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user',
        immutable: true
    }
}, {
    timestamps: true
});

const room = mongoose.model('room', roomSchema);

module.exports = room;