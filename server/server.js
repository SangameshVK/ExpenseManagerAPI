const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const httpStatusCodes = require('http-status-codes');

require('./config/config');
const {DefaultPort} = require('./utils/constants');
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

const port = process.env.PORT || constants.DefaultPort;
app.listen(port, () => {
    logger.info(`Started app on port ${port}`);
});

module.exports = {
    app
}