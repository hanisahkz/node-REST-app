// Dependencies
const http = require('http');
const url = require('url');
// an SD object
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
// Needed for HTTPS connection
const https = require('https');
const fs = require('fs');

// Create server 1 - HTTP server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});

// Start HTTP server
httpServer.listen(config.httpPort, () => {
    console.log('App is up at port '+ config.httpPort);
});

// Create server 2 - HTTPS server. Extra configuration - add variable that has HTTPS options before calling the callback
const httpsServerOptions = {
    // Most of the time, we'd want to read files asynchronously, but in this case, synchronous makes more sense
    "cert": fs.readFileSync('./https/cert.pem'),
    "key": fs.readFileSync('./https/key.pem')
};

const httpsServer = http.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

// Start HTTPS server
httpsServer.listen(config.port, () => {
    console.log('App is up at port '+ config.httpsPort);
});

// Refactor - define server logic here
const unifiedServer = (req, res) => {
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

        // Define logic that determines which handlers to choose
        let chosenHandler = typeof(router[trimmedUrl]) !== 'undefined' ? router[trimmedUrl] : handlers.notFound;
     
        // Construct data object to be sent to the handlers
        const data = {
            "trimmedPath": trimmedUrl,
            "queryObject": queryStringObject,
            "method": method,
            "headers": headersObject,
            "payload": placeholder
        };

        chosenHandler(data, (statusCode, payload) => {
            // Use status code returned by handlers, or choose a default of 200 response
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use payload returned by handlers or default to empty object
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
}

// Section for router
// Create a handlers object
let handlers = {};

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

// Router is an object. This will whitelist the allowed URL
let router = {
    'sample': handlers.sample,
    'ping': handlers.ping
};