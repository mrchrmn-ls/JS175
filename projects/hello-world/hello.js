const morgan = require("morgan");
const express = require("express");
const app = express();

const COUNTRY_DATA = [
  {
    path: "/english",
    flag: "flag-of-United-States-of-America.png",
    alt: "US Flag",
    title: "Go to US English site",
  },
  {
    path: "/french",
    flag: "flag-of-France.png",
    alt: "Drapeau de la france",
    title: "Aller sur le site français",
  },
  {
    path: "/serbian",
    flag: "flag-of-Serbia.png",
    alt: "Застава Србије",
    title: "Идите на српски сајт",
  },
];

const LANGUAGE_CODES = {
  english: "en-US",
  french: "fr-FR",
  serbian: "sr-Cyrl-rs"
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(morgan("common"));

app.locals.currentPathClass = (path, currentPath) => {
  return path === currentPath ? "current" : "";
};

app.get("/", (req, res) => {
  res.redirect("/english");
});

app.get("/:language", (req, res) => {
  res.render(`hello-world-${req.params.language}`, {
    currentPath: req.path,
    language: LANGUAGE_CODES[req.params.language],
    countries: COUNTRY_DATA
  });
});

// app.get("/english", (req, res) => {
//   res.render("hello-world-english", {
//     currentPath: req.path,
//     language: "en-US",
//     countries: COUNTRY_DATA
//   });
// });

// app.get("/french", (req, res) => {
//   res.render("hello-world-french", {
//     currentPath: req.path,
//     language: "fr-FR",
//     countries: COUNTRY_DATA
//   });
// });

// app.get("/serbian", (req, res) => {
//   res.render("hello-world-serbian", {
//     currentPath: req.path,
//     language: "sr-Cyrl-rs",
//     countries: COUNTRY_DATA
//   });
// });

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000...");
});