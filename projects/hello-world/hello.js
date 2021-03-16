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

app.get("/:language", (req, res, next) => {
  const language = req.params.language;
  const langCode = LANGUAGE_CODES[language];
  if (!langCode) {
    next(new Error(`Language not supported: ${language}`));
  } else {
    res.render(`hello-world-${language}`, {
      currentPath: req.path,
      language: langCode,
      countries: COUNTRY_DATA
    });
  }
});

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000...");
});