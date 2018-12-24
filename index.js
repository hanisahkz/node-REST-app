
// Dependencies
const http = require('http');
const url = require('url');
// an SD object
const StringDecoder = require('string_decoder').StringDecoder;

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

        // Response ending
        res.end('Response success!');
        console.log('Request received with the following payload: ', placeholder);
    });
});

// Server listen to port 3030
server.listen(3030, function() {
    console.log('App is up at localhost:3030');
});
