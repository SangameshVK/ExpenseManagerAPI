const httpStatusCodes = require('http-status-codes');

const {logger} = require("./logger");

const sendError = (response, errMsg, statusCode = httpStatusCodes.BAD_REQUEST) => {
    logger.error(`Sending errMsg: ${errMsg}, statusCode:${statusCode}`);
    response.status(statusCode);
    response.send(errMsg);
}

const sendSuccess = (response, responseBody, statusCode = httpStatusCodes.OK) => {
    logger.info(`Sending ${JSON.stringify(responseBody)} as response with statusCode:${statusCode}`);
    response.send(responseBody);
}

module.exports = {
    sendError,
    sendSuccess
}