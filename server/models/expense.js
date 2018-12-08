const _ = require('lodash');
const validator = require('validator');

const {mongoose} = require('../db/mongoose');
const {logger} = require('../utils/logger');
const {DefaultCategory} = require('../utils/constants');

var ExpenseSchma = new mongoose.Schema({
    category: {
        type: String, //Convert to enum
        required: true,
        default: DefaultCategory,
        minlength: 1,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
        minlength: 1,
        trim: true
    },
    dateTime: {
        type: Number,
        default: new Date().getTime()
    }
});

const Expense = mongoose.model('Expense', ExpenseSchma);

module.exports = {
    Expense
}
