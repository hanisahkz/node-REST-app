// Helpers for various tasks

// Dependencies
const crypto = require('crypto');
const config = require('./config');

const helpers = {};

// Logic to hash password
// Create SHA256 hash which is built-in to Node API
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.trim().length > 0) {
        // Logic to implement hashing with sha256. TODO: recap on this
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// TODO: recap on why this is being done 26:00
// called as helpers.parseJsonToObject(inputString)
helpers.parseJsonToObject = (str) => {
    // wrap JSON object in a try catch
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch (e) {
        // return empty object
        return {};
    }
}

// Export container variables
module.exports = helpers;