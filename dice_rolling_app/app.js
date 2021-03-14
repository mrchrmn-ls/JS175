/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
const HTTP = require('http');
const PORT = 3000;
const URL = require('url').URL;

function getParams(path) {
  const url = new URL(path, `http://localhost:${PORT}`);
  return url.searchParams;
}

function rollDie(sides) {
    return Math.ceil(Math.random() * sides);
}

function rollDice(rolls, sides) {
  let body = `Rolling ${rolls}D${sides}:\n`;
  let sum = 0;
  for (let roll = 1; roll <= rolls; roll += 1) {
    let result = rollDie(sides);
    body += `roll ${roll}: ${result}\n`;
    sum += result;
  }
  body += `total: ${sum}`;
  return body;
}

const SERVER = HTTP.createServer((req, res) => {
  let method = req.method;
  let path = req.url;
  let rolls = Number(getParams(path).get("rolls"));
  let sides = Number(getParams(path).get("sides"));

  if (path !== "/favicon.ico") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.write(`Method: ${method}\n`);
    res.write(`Path: ${path}\n\n`);
    res.write(`${rollDice(rolls, sides)}`);
    res.end();
  } else {
    res.statusCode = 404;
    res.end();
  }
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
