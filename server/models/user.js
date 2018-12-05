const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const {mongoose} = require('../db/mongoose');
const {GenSaltRounds} = require('../utils/constants');
const {logger} = require('../utils/logger');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator : validator.isEmail,
            message : "{Value} is not a valid email"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }  
    }]
});

UserSchema.methods.pickIdEmail = function () {
    var userObject = this.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

UserSchema.pre('save', async function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }
    try {
        var salt = await bcrypt.genSalt(GenSaltRounds);
        var passwordHash = await bcrypt.hash(user.password, salt);
        user.password = passwordHash;
        logger.info(`User password hashed to ${passwordHash} using salt ${salt}`);   
    } catch (e) {
        logger.error(`Exception hashing password for user ${user.email}: ${e.message}`);
    }
    next();
});

UserSchema.methods.generateAuthToken = async function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat([{access, token}]);
    await user.save();
    return token;
}

//TODO: Make deleteAll a promise

const User = mongoose.model('User', UserSchema);

module.exports = {
    User
}