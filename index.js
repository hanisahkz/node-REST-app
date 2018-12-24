
// Dependencies
const http = require('http');
const url = require('url');

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

    res.end('The response returned for URL: ' + trimmedUrl + ' with HTTP method: ' + method + '\n');
    console.log('Header contains the following ', headersObject);
});

// Server listen to port 3030
server.listen(3030, function() {
    console.log('App is up at localhost:3030');
});
