// Library for storing and editing data. CRUD will be performed here

// Dependencies
const fs = require('fs');
// path module will be used to point to the .data folder where we want to stash data
const path = require('path');

// Container variable that will be exported
const lib = {};

// Define a path to .data folder so that it can be used across all functions
// What's happening - __dirname tells from the current filename, navigate to .data/ using the following path /../.data/
lib.baseDir = path.join(__dirname, '/../.data/');

// TODO: RECAP BACK ON THIS FUNCTION
// PART 1: A function that writes data into filename
lib.create = (directory, filename, data, callback) => {
    // Open the filename for writing
    fs.open(lib.baseDir + directory + '/' + filename + '.json', 'wx', (err, fileDescriptor) => {
        // Check whether or not there's error & whether fileDescriptor is present
        if (!err && fileDescriptor) {
            // Convert data to string >> we'll be passing JSON data and we want it to always be a string
            const stringData = JSON.stringify(data);

            // Write the stringified data into a filename
            fs.writeFile(fileDescriptor, stringData, err => {
                // If there's no data, then data writing into filename is successful and begin closing the filename system
                if (!err) {
                    fs.close(fileDescriptor, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error while closing a new file');
                        }
                    });
                } else {
                    callback('Error writing to a new file');
                }
            });
        } else {
            callback('Could not create a new file. File might already exist');
        }
    });
};

// PART 2: Read from the filename
lib.read = (filename, file, callback) => {
    fs.readFile(lib.baseDir + filename + '/' + file + '.json', 'utf-8', (err, data) => {
        callback(err, data);
    });
};

// PART 3: Update data from the generated filename >> A lot of this logic will be similar to the Create action
lib.update = (directory, filename, data, callback) => {
    fs.open(lib.baseDir + directory + '/' + filename+'.json', 'r+', (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
            const stringData = JSON.stringify(data);

            //Modify this logic to just update the data by truncating instead of replacing this
            fs.ftruncate(fileDescriptor, err => {
                // If there's no error, proceed with truncating (updating the filename)
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, err => {
                        if (!err) {
                            fs.close(fileDescriptor, err => {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing the existing file');
                                }
                            });
                        } else {
                            callback('Error while trying to close an existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        }
    });
};

// PART 4: Delete a filename
lib.delete = (directory, filename, callback) => {
    // Logic will perform unlink i.e. it will just remove the filename system created from the folder .data
    fs.unlink(lib.baseDir + directory + '/' + filename + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error while deleting a file');
        }
    });
};

// Variable to be exported
module.exports = lib;