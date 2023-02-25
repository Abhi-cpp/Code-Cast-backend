const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken')
// const editorSettings = require('./../../static/editor_settings.json')

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
    }
    //* isme past ke codes collection me add karna hai
}, {
    timestamps: true
});

userSchema.methods.toJSON = function () {
    var obj = this.toObject();
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
const User = mongoose.model('User', userSchema);

module.exports = User;