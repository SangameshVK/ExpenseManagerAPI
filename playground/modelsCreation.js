const {ObjectID} = require('mongodb');

var {User} = require('../server/models/user');
var {Expense} = require('../server/models/expense');

var user = new User({'email': 'abcd@gmail.com', 'password': 'abcdefgh'});
user.save().catch(err => console.log(err.message));

var category = '';
var creator = new ObjectID();
var description = 'Daal Kichdi';
var amount = 100;
var expense = new Expense({amount, creator, description, 'adfdfs': 'dsfsdkfsdjfs'});
expense.save().then((exp) => {
    console.log(exp.dateTime);
}).catch(err => console.log(err.message));