var {User} = require('../server/models/user');

var user = new User({'email': 'abcd@gmail.com', 'password': 'abcdefgh'});
user.save().catch(err => console.log(err.message));