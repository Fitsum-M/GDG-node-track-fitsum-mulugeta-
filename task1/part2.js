const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 4000;

let students = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
];
let nextId = 4;

function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                if (req.headers['content-type'] !== 'application/json') {
                    return reject({ status: 400, message: 'Content-Type must be application/json' });
                }
                if (!body) {
                     return resolve({});
                }
                resolve(JSON.parse(body));
            } catch (error) {
                reject({ status: 400, message: 'Invalid JSON format' });
            }
        });
        req.on('error', (err) => {
            reject({ status: 500, message: 'Error reading request body' });
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathSegments = parsedUrl.pathname.split('/').filter(segment => segment.length > 0);

    res.setHeader('Content-Type', 'application/json');

    if (method === 'GET' && pathSegments[0] === 'students' && pathSegments.length === 1) {
        res.statusCode = 200;
        res.end(JSON.stringify(students));
    }

    else if (method === 'POST' && pathSegments[0] === 'students' && pathSegments.length === 1) {
        try {
            const data = await getRequestBody(req);

            if (!data.name || typeof data.name !== 'string') {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Missing or invalid "name" in request body' }));
            }

            const newStudent = {
                id: nextId++,
                name: data.name
            };

            students.push(newStudent);

            res.statusCode = 201;
            res.end(JSON.stringify(newStudent));

        } catch (error) {
            res.statusCode = error.status || 500;
            res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
        }
    }

    else if (pathSegments[0] === 'students' && pathSegments.length === 2) {
        const studentId = parseInt(pathSegments[1], 10);
        const studentIndex = students.findIndex(s => s.id === studentId);
        const student = students[studentIndex];

        if (method === 'PUT') {
            try {
                const data = await getRequestBody(req);

                if (!student) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({ error: `Student with id ${studentId} not found` }));
                }

                if (!data.name || typeof data.name !== 'string') {
                    res.statusCode = 400;
                    return res.end(JSON.stringify({ error: 'Missing or invalid "name" in request body' }));
                }

                students[studentIndex].name = data.name;

                res.statusCode = 200;
                res.end(JSON.stringify(students[studentIndex]));

            } catch (error) {
                res.statusCode = error.status || 500;
                res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
            }
        }

        else if (method === 'DELETE') {
            if (!student) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: `Student with id ${studentId} does not exist` }));
            }

            students.splice(studentIndex, 1);

            res.statusCode = 200;
            res.end(JSON.stringify({ message: `Student with id ${studentId} successfully removed` }));
        }

        else {
            res.statusCode = 405;
            res.setHeader('Allow', 'PUT, DELETE');
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
    }

    else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: '404 Not Found' }));
    }
});

server.listen(port, hostname, () => {
    console.log(`Student API server running at http://${hostname}:${port}/`);
});