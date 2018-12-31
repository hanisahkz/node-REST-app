// These are handlers for routing requests

// Dependencies
const _data = require('./data');
const helpers = require('./helpers')

// Create a handlers object
let handlers = {};

// Handler for route: users
handlers.users = (data, callback) => {
    // Only allow the following HTTP methods: GET, PUT, POST, DELETE
    const acceptableMethods = ['get', 'post', 'put', 'delete'];

    // If request sent matches any of the acceptable HTTP methods,
    if (acceptableMethods.indexOf(data.method) > -1) {
        // Function called would translate like so: handlers._users.get(someData, callback);
        handlers._users[data.method](data, callback); 
    // If it doesn't, return 405 Method not allowed
    } else {
        callback(405);
    }
};

// TODO: to rephrase the sentence
// Containers for users submethod that only accepts get, post, put, delete
// '_users' is used to denote the private method only accessed by the handler
handlers._users = {};

// Submethod 1 _users that accepts post and accept 2 params - i) data, ii) callback
// Required data: i) firstName (string), ii) lastName (string), iii) phone (string), iv) password (strin), v) tosAgreement (boolean)
// No optional data
handlers._users.post = (data, callback) => {
    console.log(data.payload);
    // Logic that validates the payload
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if (firstName && lastName && phone && password && tosAgreement) {
        // When creating a ner user, ensure that user doesn't already exist based on unique phone number
        // The logic will check against existing user record from the 'users' folder
        _data.read('users', phone, (err, data) => {
            // Error is true i.e. callback is true, means the user doesn't exist, so proceed to creating a new user
            if (err) {
                // When creating a new user, hash the password which will be done using a helper. This method should return hashedPassword
                const hashedPassword = helpers.hash(password);

                // Create a user object
                if (hashedPassword) {
                    const userObj = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };
                    
                    // Store user in file system for persistence
                    _data.create('users', phone, userObj, (err) => {
                        if (!err) {
                            callback(200, {'Success': 'User successfully created!'});
                        } else {
                            console.log(err);
                            // At this point, highly logical situation is that the server is down
                            callback(500, {'Error': 'Could not create user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash user\'s password'});
                }   
            // If user already exists, return error message
            } else {
                callback(400, {'Error': 'The user with the specified phone number already exists'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field or specified input failed validation.'});
    }
};

// Submethod 2 _users that accept get and accept 2 params - i) data, ii) callback
// Required data: phone
// Optional data: none
// TODO: only allow authenticated user to access their object/record. Don't allow to access someone elses
handlers._users.get = (data, callback) => {
    const phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 11 ? data.queryStringObj.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                // When reading user record, remove the hashed password from the returned response
                // delete is a JS operator which can delete property but not an object.
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404, {'Error': 'User based on the specified phone number doesn\'t exist'});
            }
        });
    } else {
        callback(400, {'Error': 'Must specify an 11-digit phone number'});
    }
};

// Submethod 3 _users that accepts put request and accept 2 params - i) data, ii) callback
// Required: phone
// Optional data: Everything but phone number. However, in addition to specifying phone number, at least one of the optional fields must be specified
// TODO: Only authenticated user can update their record
handlers._users.put = (data, callback) => {
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.phone.trim() : false;

    // Chech for optional fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    // Only continue if phone number is valid
    if (phone) {
        // Only require any of the conditional field
        if (firstName || lastName || password) {
            // Check against the record if the user exists
            _data.read('users', phone, (err, userData) => {
                if (!err && userData) {
                    // Then only update the requested field
                    if (firstName) {
                        userData.firstName = firstName;
                    }

                    if (lastName) {
                        userData.lastName = lastName;
                    }

                    if (password) {
                        userData.hashedPassword = helpers.hash(password);
                    }

                    _data.update('users', phone, userData, (err) => {
                        if (!err) {
                            callback(200, {'Success' : 'User record successfully updated!'});
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Couldn\'t update user'});
                        }
                    });
                } else {
                    callback(404, {'Error': 'User doesn\'t exist'});
                }
            });
        } else {
            callback(400, {'Error': 'Must update at least one of the following field: firstName or lastName or password'});
        }
    } else {
        callback(404, {'Error': 'Must specify an existing 11-digit phone number to update record'});
    }
};

// Submethod 4 _users that accept delete request and accept 2 params - i) data, ii) callback
// Setup is similar to get
// TODO: only authenticated user can delete their record
handlers._users.delete = (data, callback) => {
    const phone = typeof(data.queryStringObj.phone) == 'string' && data.queryStringObj.phone.trim().length == 11 ? data.queryStringObj.phone.trim() : false;

    if (phone) {
        // If a phone number is specified, find the associated record
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200, {'Success': 'Specified user has been deleted'});
                    } else {
                        callback(500, {'Error': 'Couldn\'t delete the specified user'});
                    }
                });
            } else {
                callback(404, {'Error': 'User based on the specified phone number doesn\'t exist'});
            }
        });
    } else {
        callback(400, {'Error': 'Must specify an 11-digit phone number'});
    }
};

// Define a sample handlers with a function that accepts data and callback
handlers.sample = (data, callback) => {
    // callback should return HTTP 200 and payload object when request is completed
    const handlerPayload = {
        'status': 'Request successful',
        'payload': 'Some random content'
    };
    callback(406, handlerPayload);
};

handlers.ping = (data, callback) => {
    // This call only returns request's status code. This doesn't generate payload.
    callback(200);
};

// Not found handlers
handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;