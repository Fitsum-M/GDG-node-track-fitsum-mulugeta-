const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    res.setHeader('Content-Type', 'text/plain');

    if (method === 'GET' && path === '/') {
        res.statusCode = 200;
        res.end('Welcome to the Home Page');
    }

    else if (method === 'GET' && path === '/info') {
        res.statusCode = 200;
        res.end('This is the information page');
    }

    else if (method === 'POST' && path === '/submit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                if (req.headers['content-type'] !== 'application/json') {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Error: Content-Type must be application/json');
                    return;
                }

                const jsonBody = JSON.parse(body);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(jsonBody));

            } catch (error) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error: Invalid JSON format');
            }
        });
    }

    else {
        res.statusCode = 404;
        res.end('404 Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});