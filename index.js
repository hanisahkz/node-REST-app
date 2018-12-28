
// Dependencies
const http = require('http');
const url = require('url');
// an SD object
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// Server responds to all string
const server = http.createServer(function(req, res) {
    //req is an instance of IncomingMessage that has a number of keys
    //req.url means accessing IncomingMessage's key
    const parsedUrl = url.parse(req.url, true);
    
    // Get the path
    const path = parsedUrl.pathname;
    // some Regex pattern to cleanse user input returned
    const trimmedUrl = path.replace(/^\/+|\/+$/g, '');
    
    // Create a query string object
    const queryStringObject = parsedUrl.query;

    // Create a header object
    const headersObject = req.headers;

    // Get request HTTP method
    const method = req.method.toLowerCase();

    // Get payload if present. Pass charset it should be decoding
    // utf-8 is pretty common when dealing with JSON API
    let decoder = new StringDecoder('utf-8');
    let placeholder = '';

    // Event binding as "data comes in" / during "data" event
    // Disclaimer: request's "data" event won't always get called
    req.on('data', (data) => {
        // Append data to the placeholder as data is streaming (coming) in
        // since the data coming in are in utf-8 format, so it will be decoded
        // whenever data streams in, it will be decoded before appended to the placeholder
        placeholder += decoder.write(data);
    }); 

    // This tells that when there's no more request ie when the request is done
    // Disclaimer: request's "end" event will always gets called
    req.on('end', () => {
        placeholder += decoder.end();

        // Define logic that determines which handler to choose
        let chosenHandler = typeof(router[trimmedUrl]) !== 'undefined' ? router[trimmedUrl] : handler.notFound;
     
        // Construct data object to be sent to the handler
        const data = {
            "trimmedPath": trimmedUrl,
            "queryObject": queryStringObject,
            "method": method,
            "headers": headersObject,
            "payload": placeholder
        };

        chosenHandler(data, (statusCode, payload) => {
            // Use status code returned by handler, or choose a default of 200 response
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use payload returned by handler or default to empty object
            payload = typeof(payload) == 'object' ? payload : {};
            
            // Every payload receives now is an object. So, need to convert into a String
            const payloadString = JSON.stringify(payload);

            // Return the response
            // This tells browser that we are sending JSON request and the browser should know that they are getting JSON object and process accordingly 
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Status code and response: ', statusCode, payloadString);
        });
    });
});

// Server defaulted to port 3030 if in staging or unspecified
server.listen(config.port, function() {
    console.log('App is up port '+ config.port + ' for environment: ' + config.envName);
});

// Section for router
// Create a handler object
let handler = {};

// Define a sample handler with a function that accepts data and callback
handler.sample = (data, callback) => {
    // callback should return HTTP 200 and payload object when request is completed
    const handlerPayload = {
        'status': 'Request successful',
        'payload': 'Some random content'
    };
    callback(406, handlerPayload);
};

handler.someUrl = (data, callback) => {
    const handlerPayload = {
        'status': 'Request made to /someUrl',
        'payload': 'Payload body'
    };
    callback(200, handlerPayload);
};

// Not found handler
handler.notFound = (data, callback) => {
    callback(404);
};

// Router is an object. This will whitelist the allowed URL
let router = {
    'sample': handler.sample,
    'someUrl': handler.someUrl
};