const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('../../../models/user');
const {Expense} = require('../../../models/expense');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id : userOneId,
    email: 'andrew@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: userTwoId,
    email: 'jen@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
    }]
}];

const expenseOneId = new ObjectID();
const expenseTwoId = new ObjectID();
const expenses = [{
    _id: expenseOneId,
    amount: 100.50,
    creator: userOneId,
    description: "Sample Expense 1",
    dateTime: new Date().getTime()
},{
    _id: expenseTwoId,
    category: "Food",
    amount: 200,
    creator: userTwoId
}];

const populateUsers = (done) => {
    User.deleteMany({}, async () => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        await Promise.all([userOne, userTwo]);
        done();
    });
};

const populateExpenses = (done) => {
    Expense.deleteMany({}, async () => {
        var expenseOne = new Expense(expenses[0]).save();
        var expenseTwo = new Expense(expenses[1]).save();
        await Promise.all([expenseOne, expenseTwo]);
        done();
    });
}

module.exports = {users, populateUsers, expenses, populateExpenses};