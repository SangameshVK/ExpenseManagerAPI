const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const httpStatusCodes = require('http-status-codes');
const bcrypt = require('bcryptjs');

require('./config/config');
const {UserDoesNotExistMsg, PasswordIncorrectMsg} = require('./utils/constants');
const {sendError, sendSuccess} = require('./utils/utils');
const {User} = require('./models/user');
const {logger} = require('./utils/logger');
const app = new express();

app.use(bodyParser.json());

app.post("/signup", async (req, res) => {
    try {
        var body = _.pick(req.body, ["email", "password"]);
        var user = new User(body);
        await user.save();
        logger.info(`Saved user ${user.email} into database`);
        const token = await user.generateAuthToken();
        res.header('x-auth', token);
        sendSuccess(res, user.pickIdEmail());
    } catch (e) {
        logger.error(e);
        sendError(res, e.errmsg? e.errmsg : e.message); //TODO: Send a proper error messsage.
    }
});

app.post('/login', async (req, res) => {
    try {
        var {email, password} = _.pick(req.body, ['email', 'password']);
        var user = await User.findOne({email});
        if (!user) {
            return sendError(res, UserDoesNotExistMsg);
        }
        logger.info(`Found user in DB: ${user}`);
        var passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return sendError(res, PasswordIncorrectMsg, httpStatusCodes.UNAUTHORIZED);
        }
        const token = await user.generateAuthToken();
        res.header('x-auth', token);
        sendSuccess(res, user.pickIdEmail());
    } catch (e) {
        logger.error(e);
        sendError(res, e.message);
    }
})

const port = process.env.PORT || constants.DefaultPort;
app.listen(port, () => {
    logger.info(`Started app on port ${port}`);
});

module.exports = {
    app
}