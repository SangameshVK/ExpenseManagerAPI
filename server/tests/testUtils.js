const bcrypt = require("bcryptjs");
const expect = require("expect");

const {User} = require("../models/user");
const constants = require("../utils/constants");

var email = constants.TestEmail;
var password = constants.TestPassword;

const verifyUserInDB = async (res) => {
    var user = await User.findOne({email});
    expect(user).toBeTruthy();
    var passwordCompare = await bcrypt.compare(password, user.password);
    expect(passwordCompare).toBeTruthy();
    expect(user.toObject().tokens[0]).toMatchObject({
        access: 'auth',
        token: res.headers['x-auth']
    });
}

const verifyAuthResponse = (res) => {
    expect(res.headers['x-auth']).toBeTruthy();
    expect(res.body.email).toBe(email);
    expect(res.body._id).toBeTruthy();
}

module.exports = {
    verifyUserInDB,
    verifyAuthResponse
}
