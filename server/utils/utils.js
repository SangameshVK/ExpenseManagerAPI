const httpStatusCodes = require('http-status-codes');

const {logger} = require('./logger');
const {FilterProperties} = require('./constants');
 
const sendError = (response, error, statusCode = httpStatusCodes.BAD_REQUEST) => {
    logger.error(`Sending error: ${error}, statusCode: ${statusCode}`);
    response.status(statusCode);
    response.send({error});
}

const sendSuccess = (response, responseBody, statusCode = httpStatusCodes.OK) => {
    logger.info(`Sending ${JSON.stringify(responseBody)} as response with statusCode: ${statusCode}`);
    response.send(responseBody);
}

const filterExpense = function (expense, keysToFilter = FilterProperties) {
    var retVal = {}
    // Work around to avoid expenses being considered as an object.
    expense = JSON.parse(JSON.stringify(expense));
    Object.keys(expense).forEach((key) => {
        if (keysToFilter.indexOf(key) == -1) {
            retVal[key] = expense[key];
        }
    });
    return retVal;
}

const filterMultipleExpenses = (expenses, keysToFilter = FilterProperties) => {
    try {
        var retVal = [];
        expenses.forEach(expense => {
            retVal = retVal.concat(filterExpense(expense, keysToFilter));
        });
        return retVal;
    } catch (e) {
        logger.warn(`Error filtering multiple expenses: ${e.message}. Returing expenses as is.`);
        return expenses;
    }
}

module.exports = {
    sendError,
    sendSuccess,
    filterMultipleExpenses,
    filterExpense
}