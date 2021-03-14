const HTTP = require('http');
const PORT = 3000;

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;

  if (path !== "/favicon.ico") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.write(`Method: ${method}\n`);
    res.write(`Path: ${path}`);
    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});