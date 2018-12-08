const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //To find out: what this does
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ExpensesDB", { useNewUrlParser: true, useCreateIndex: true });

module.exports = {
    mongoose
}

//TODO: Remove deprecationwarning: collection.ensureIndex is depreciated.  Use rcreateIndexes instead.