// TODO: to dynamically set port to listen to from CLI
// This is where config-related variables reside
// Environment will be a container for all environment variables i.e. "staging" or "production"
let environments = {};

// Environment variables with their own configuration
//"staging" environment will be default
environments.staging = {
    "httpPort": 3030,
    "httpsPort": 3031,
    "envName": "staging",
    "hashingSecret" : "someSecret"
};

environments.production = {
    "httpPort": 8081,
    "httpsPort": 8082,
    "envName": "production",
    "hashingSecret": "someOtherSecret"
};

// Implement checking to determine the final environment variable to be used
// 1) Check if any input is being passed to process.env.NODE_NAME from CLI. If present, use it. If not, assign empty string
const currentEnvironment = typeof(process.env.SOME_NODE_ENV) == 'string' ? 
// convention is to use: process.env.NODE_ENV, but just want to demonstate that the naming is arbitrary
process.env.SOME_NODE_ENV.toLocaleLowerCase() : '';

// 2) Check whether the environment specified is valid i.e. any of the above
const environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// 3) Export the finalized environment variable
module.exports = environmentToExport;