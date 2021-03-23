/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

const TodoList = require("./lib/todolist");
const { sortByTitleAndStatus } = require("./lib/sort");

const app = express();
const HOST = "localhost";
const PORT = 3000;

//static data for initial testing
let todoLists = require("./lib/seed-data");
const Todo = require("./lib/todo");


app.set("view engine", "pug");
app.set("views", "./views");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "This really isn't secure at all"
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

function getListById(lists, id) {
  return lists.find(list => list.getId() === id);
}

app.get("/", (_req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (_req, res) => {
  res.render("lists", { todoLists: sortByTitleAndStatus(todoLists) });
});

app.get("/lists/new", (_req, res) => {
  res.render("new-list");
});

app.get("/lists/:todoListId", (req, res, next) => {
  let id = Number(req.params.todoListId);
  let list = getListById(todoLists, id);
  if (list) {
    res.render("list", {
      todoList: list,
      todos: sortByTitleAndStatus(list.getTodos())
    });
  } else {
      next(new Error("Todo list not found."));
  }
});

app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1})
      .withMessage("You need to provide a title.")
      .isLength({ max: 100})
      .withMessage("Title must be shorter than 100 characters.")
      .custom(title => !todoLists.some(list => list.getTitle() === title))
      .withMessage("A list with this title already exists.")
  ],
  (req, res) => {
    let title = req.body.todoListTitle;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: title
      });
    } else {
      todoLists.push(new TodoList(title));
      req.flash("success", "The new todo list has been added.");
      res.redirect("/lists");
    }
  }
);

app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404)
     .send(err.message);
});

// Listener
app.listen(PORT, HOST, () => {
  console.log(`Todos listening on port ${PORT} of ${HOST}.`);
});