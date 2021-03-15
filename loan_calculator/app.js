/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
const HTTP = require("http");
const URL = require("url").URL;
const QUERYSTRING = require('querystring');
const HANDLEBARS = require("handlebars");
const ROUTER = require("router");
const FINALHANDLER = require("finalhandler");
const SERVESTATIC = require("serve-static");

const PORT = 3000;
const APR = 5;

const LOAN_OFFER_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <table>
        <tbody>
          <tr>
            <th>Amount:</th>
            <td>
              <a href="/loan-offer?amount={{amountDecrement}}&duration={{duration}}">- $100</a>
            </td>
            <td>$ {{amount}}</td>
            <td>
              <a href="/loan-offer?amount={{amountIncrement}}&duration={{duration}}">+ $100</a>
            </td>
          </tr>
          <tr>
            <th>Duration:</th>
            <td>
              <a href="/loan-offer?amount={{amount}}&duration={{durationDecrement}}">- 1 year</a>
            </td>
            <td>{{duration}} years</td>
            <td>
              <a href="/loan-offer?amount={{amount}}&duration={{durationIncrement}}">+ 1 year</a>
            </td>
          </tr>
          <tr>
            <th>APR:</th>
            <td colspan="3">{{apr}}%</td>
          </tr>
          <tr>
            <th>Monthly payment:</th>
            <td colspan="3">$ {{payment}}</td>
          </tr>
        </tbody>
      </table>
    </article>
  </body>
</html>`;

const LOAN_FORM_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Loan Calculator</title>
    <link rel="stylesheet" href="/assets/css/styles.css">
  </head>
  <body>
    <article>
      <h1>Loan Calculator</h1>
      <form action="/loan-offer" method="post">
        <p>All loans are offered at an APR of {{apr}}%.</p>
        <label for="amount">How much do you want to borrow (in dollars)?</label>
        <input type="number" name="amount" value="">
        <label for="amount">How much time do you want to pay back your loan?</label>
        <input type="number" name="duration" value="">
        <input type="submit" name="" value="Get loan offer!">
      </form>
    </article>
  </body>
</html>`;

const LOAN_OFFER_TEMPLATE = HANDLEBARS.compile(LOAN_OFFER_HTML);
const LOAN_FORM_TEMPLATE = HANDLEBARS.compile(LOAN_FORM_HTML);

function render(template, data) {
  let html = template(data);
  return html;
}

function getPathname(path) {
  const url = new URL(path, `http://localhost:${PORT}`);
  return url.pathname;
}

function parseFormData(request, callback) {
  let body = "";
    request.on("data", chunk => {
      body += chunk.toString();
    });
    request.on("end", () => {
      let data = QUERYSTRING.parse(body);
      data.amount = Number(data.amount);
      data.duration = Number(data.duration);
      callback(data);
    });
}

function getQueryData(path) {
  const url = new URL(path, `http://localhost:${PORT}`);
  let params = url.searchParams;
  let amount = Number(params.get("amount"));
  let duration = Number(params.get("duration"));

  return {
    amount,
    duration
  };
}

function monthlyPayment(amount, apr, years) {
  let months = 12 * years;
  let aprMonthly = (apr / 100) / 12;
  return (amount *
         (aprMonthly /
         (1 - Math.pow((1 + aprMonthly), (-months)))))
         .toFixed(2);
}

function loanOffer(data) {
  return Object.assign(data, {
    amountIncrement: data.amount + 100,
    amountDecrement: data.amount - 100,
    durationIncrement: data.duration + 1,
    durationDecrement: data.duration - 1,
    apr: APR,
    payment: monthlyPayment(data.amount, APR, data.duration)
  });
}

let router = ROUTER();
router.use(SERVESTATIC("public"));

router.get("/", function(req, res) {
  let body = render(LOAN_FORM_TEMPLATE, {apr: APR});

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.write(`${body}\n`);
  res.end();
});

router.get("/loan-offer", function(req, res) {
  let loanData = loanOffer(getQueryData(req.url));
  let body = render(LOAN_OFFER_TEMPLATE, loanData);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.write(`${body}\n`);
  res.end();
});

router.post("/loan-offer", function(req, res) {
  parseFormData(req, parsedData => {
    let loanData = loanOffer(parsedData);
    let body = render(LOAN_OFFER_TEMPLATE, loanData);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.write(`${body}\n`);
    res.end();
  });
});

router.get("*", function(req, res) {
  res.statusCode = 404;
  res.end();
});

const SERVER = HTTP.createServer((req, res) => {
  router(req, res, FINALHANDLER(req, res));
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});