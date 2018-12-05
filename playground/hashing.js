const bcrypt = require('bcryptjs');

asyncFunc = async (password) => {
    var salt = await bcrypt.genSalt(10);
    var passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);
    var passwordCompare = await bcrypt.compare(password, passwordHash);
    console.log(passwordCompare);
}

asyncFunc('abc123');