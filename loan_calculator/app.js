/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
const HTTP = require('http');
const PORT = 3000;
const URL = require('url').URL;

const HTML_START = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <style type="text/css">
      body {
        background: rgba(250, 250, 250);
        font-family: sans-serif;
        color: rgb(50, 50, 50);
      }

      article {
        width: 100%;
        max-width: 40rem;
        margin: 0 auto;
        padding: 1rem 2rem;
      }

      h1 {
        font-size: 2.5rem;
        text-align: center;
      }

      table {
        font-size: 2rem;
      }

      th {
        text-align: right;
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
`;

const HTML_END = `
        </tbody>
      </table>
    </article>
  </body>
</html>`;

function getParams(path) {
  const url = new URL(path, `http://localhost:${PORT}`);
  return url.searchParams;
}

function monthlyPayment(amount, apr, years) {
  let months = 12 * years;
  let aprMonthly = (apr / 100) / 12;
  return (amount *
      (aprMonthly /
      (1 - Math.pow((1 + aprMonthly), (-months))))).toFixed(2);
}

function loanOffer(params) {
  let amount = Number(params.get("amount"));
  let apr = Number(params.get("apr"));
  let duration = Number(params.get("duration"));
  if (!apr) apr = 5;

  return `
  <tr>
    <th>Amount:</th>
    <td>
      <a href='/?amount=${amount - 100}&duration=${duration}'>- $100</a>
    </td>
    <td>$${amount}</td>
    <td>
      <a href='/?amount=${amount + 100}&duration=${duration}'>+ $100</a>
    </td>
  </tr>
  <tr>
    <th>Duration:</th>
    <td>
      <a href='/?amount=${amount}&duration=${duration - 1}'>- 1 year</a>
    </td>
    <td>${duration} years</td>
    <td>
      <a href='/?amount=${amount}&duration=${duration + 1}'>+ 1 year</a>
    </td>
  </tr>
  <tr>
    <th>APR:</th>
    <td colspan='3'>${apr}%</td>
  </tr>
  <tr>
    <th>Monthly payment:</th>
    <td colspan='3'>$${monthlyPayment(amount, apr, duration)}</td>
  </tr>`;
}

const SERVER = HTTP.createServer((req, res) => {
  let path = req.url;

  let body = HTML_START +
             loanOffer(getParams(path)) +
             HTML_END;

  if (path === "/favicon.ico") {
    res.statusCode = 404;
    res.end();
  } else {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.write(body);
    res.end();
  }

});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});