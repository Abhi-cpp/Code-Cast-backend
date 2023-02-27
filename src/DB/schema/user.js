const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken')
const Room = require('./room')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        immutable: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    avatar: {
        type: String
    },
    editor: {
        language: {
            type: String,
            default: "javascript",
            trim: true,
        },
        theme: {
            type: String,
            default: 'vs-dark',
            trim: true,

        },
        fontSize: {
            type: Number,
            default: 14,
            trim: true,
        },
        fontFamily: {
            type: String,
            default: 'Fira Code',
            trim: true,
        },
        setting: {
            // all settins of @monaco-editor/react
            autoIndent: {
                type: Boolean,
                default: true,
            },
            formatOnSave: {
                type: Boolean,
                default: true,
            },
            minimap: {
                type: Boolean,
                default: true,
            },
            wordWrap: {
                type: String,
                default: "on",
            },
            tabSize: {
                type: Number,
                default: 4,
            },
            autoSuggestions: {
                type: Boolean,
                default: true,
            }
        }
    },
    rooms: [{
        type: Schema.Types.ObjectId,
        ref: 'room'
    }]
}, {
    timestamps: true
});


userSchema.methods.toJSON = function () {
    let obj = this.toObject();
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.__v;
    return obj
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7 day' })
    return token
}

//* use this only after joining the room collection
userSchema.pre('remove', async function (next) {
    const user = this
    await Room.deleteMany({ owner: user._id })
    next()
})


const User = mongoose.model('user', userSchema);

module.exports = User;