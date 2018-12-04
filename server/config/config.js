const constants = require('../utils/constants');
const {logger} = require('../utils/logger');

const env = process.env.NODE_ENV || constants.DevelopmentEnv;
logger.info(`Environment: ${env}`);
if (env === constants.TestEnv || env === constants.DevelopmentEnv) {
    const config = require('./config.json');
    Object.keys(config[env]).forEach((key) => {
        process.env[key] = config[env][key];
    });
};