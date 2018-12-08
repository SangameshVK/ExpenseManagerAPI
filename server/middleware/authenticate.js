const httpStatusCodes = require('http-status-codes');

var {User} = require('./../models/user');
const {logger} = require('../utils/logger');
const {sendError} = require('../utils/utils');

var authenticate = async (req, res, next) => {
    try {
        var token = req.header('x-auth');
        var user = await User.findByToken(token);
        if (!user) {
            return Promise.reject();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        logger.error(`Authentication failure ${e}`);
        sendError(res, 'Could not authenticate', httpStatusCodes.UNAUTHORIZED);
    }
};

module.exports = {
    authenticate
};