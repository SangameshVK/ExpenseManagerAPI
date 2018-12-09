const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const httpStatusCodes = require('http-status-codes');
const bcrypt = require('bcryptjs');
const {ObjectID} = require('mongodb');

require('./config/config');
const {UserDoesNotExistMsg, PasswordIncorrectMsg, InvalidIdMsg, IdNotFoundMsg} = require('./utils/constants');
const {sendError, sendSuccess, filterExpense, filterMultipleExpenses} = require('./utils/utils');
const {User} = require('./models/user');
const {Expense} = require('./models/expense');
const {logger} = require('./utils/logger');
const {authenticate} = require('./middleware/authenticate');

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
        logger.error(`Error signing up ${e}`);
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
        logger.error(`Error logging in ${e.message}`);
        sendError(res, e.message);
    }
});

app.post('/expense',authenticate, async (req, res) => {
    try {
        var expense = new Expense(req.body);
        expense.creator = req.user._id;
        await expense.save();
        logger.info(`Saved expense ${expense._id} to database`);
        expense = filterExpense(expense);
        sendSuccess(res, expense);
    } catch(e) {
        logger.error(`Expense creation unsunccessful ${e.message}`);
        sendError(res, e.message);
    }
});

app.get('/expenses', authenticate, async (req, res) => {
    try {
        var expenses = await Expense.find({creator: req.user._id});
        if (!expenses) {
            return sendError(res, "No Expenses Found");
        }
        expenses = filterMultipleExpenses(expenses);
        sendSuccess(res, {expenses}); 
    } catch(e) {
        logger.error(`Error getting all expenses ${e.message}`);
        sendError(res, e.message);
    }
});

app.get('/expense/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)){
        return sendError(res, InvalidIdMsg);
    }
    try {
        var expense = await Expense.findOne({_id: id, creator: req.user._id});
        if (!expense) {
            return sendError(res, IdNotFoundMsg, httpStatusCodes.NOT_FOUND);
        }
        expense = filterExpense(expense);
        sendSuccess(res, {expense});
    } catch (e) {
        logger.error(`Could not get expense id ${id}. ${e.message}`);
        sendError(res, e.message);
    }
});

app.delete('/expense/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return sendError(res, InvalidIdMsg);
    }
    try {
        var expense = await Expense.findOneAndRemove({_id: id, creator: req.user._id});
        if (!expense) {
            return sendError(res, IdNotFoundMsg, httpStatusCodes.NOT_FOUND);
        }
        expense = filterExpense(expense);
        sendSuccess(res, {expense});
    } catch (e) {
        logger.error(`Could not delete expense id ${id}. ${e.message}`);
        sendError(res, e.message);
    }
});

app.patch('/expense/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return sendError(res, InvalidIdMsg);
    }
    try {
        var immutableProperties = ['__v', '_id', 'creator'];
        var invalidBody = false;
        Object.keys(req.body).forEach((key) => {
            if (immutableProperties.indexOf(key) != -1) {
                invalidBody = true;
            }
        })
        if (invalidBody) {
            return sendError(res, "Trying to edit immutable properties", httpStatusCodes.BAD_REQUEST);
        }
        var expense = await Expense.findOneAndUpdate({_id: id, creator: req.user._id}, {$set: req.body}, {new: true});
        if (!expense) {
            return sendError(res, IdNotFoundMsg, httpStatusCodes.NOT_FOUND);
        }
        //expense = filterExpense(expense);
        sendSuccess(res, {expense});
    } catch (e) {
        logger.error(`Could not update expense id ${id}. ${e.message}`);
        sendError(res, e.message);
    }
});

const port = process.env.PORT || constants.DefaultPort;
app.listen(port, () => {
    logger.info(`Started app on port ${port}`);
});

module.exports = {
    app
}