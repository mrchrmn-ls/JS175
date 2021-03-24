/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");

const TodoList = require("./lib/todolist");
const Todo = require("./lib/todo");
const { sortByTitleAndStatus } = require("./lib/sort");

const app = express();
const HOST = "localhost";
const PORT = 3000;

// static data for initial testing
let todoLists = require("./lib/seed-data");


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


app.get("/", (_req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (_req, res) => {
  res.render("lists", { todoLists: sortByTitleAndStatus(todoLists) });
});

app.get("/lists/new", (_req, res) => {
  res.render("new-list");
});


function getListFromId(lists, id) {
  return lists.find(list => list.getId() === id);
}

function removeListById(lists, id) {
  let index = lists.findIndex(list => list.getId() === id);
  lists.splice(index, 1);
}

app.get("/lists/:todoListId", (req, res, next) => {
  let id = Number(req.params.todoListId);
  let list = getListFromId(todoLists, id);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    res.render("list", {
      todoList: list,
      todos: sortByTitleAndStatus(list.getTodos())
    });
  }
});


app.get("/lists/:todoListId/edit", (req, res, next) => {
  let id = Number(req.params.todoListId);
  let list = getListFromId(todoLists, id);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    res.render("edit-list", {
      todoList: list
    });
  }
});


app.post("/lists/:todoListId/destroy", (req, res, next) => {
  let id = Number(req.params.todoListId);
  let list = getListFromId(todoLists, id);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    removeListById(todoLists, id);
    req.flash("success", `List "${list.getTitle()}" deleted.`);
    res.redirect("/lists");
  }
});


app.post("/lists/:todoListId/edit",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to provide a title.")
      .isLength({ max: 100 })
      .withMessage("Title must be shorter than 100 characters.")
      .custom(title => !todoLists.some(list => list.getTitle() === title))
      .withMessage("A list with this title already exists.")
  ],
  (req, res, next) => {
    let id = Number(req.params.todoListId);
    let list = getListFromId(todoLists, id);

    if (!list) {
      next(new Error("Todo list not found."));
    } else {
      let title = req.body.todoListTitle;
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        res.render("edit-list", {
          flash: req.flash(),
          todoListTitle: title,
          todoList: list
        });
      } else {
        req.flash("success", `"${list.getTitle()}" has been renamed "${title}".`);
        list.setTitle(title);
        res.redirect("/lists");
      }
    }
  }
);


app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  let id = Number(req.params.todoListId);
  let list = getListFromId(todoLists, id);
  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    list.markAllDone();
    res.redirect(`/lists/${id}`);
  }
});


app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  let listId = Number(req.params.todoListId);
  let todoId = Number(req.params.todoId);
  let list = getListFromId(todoLists, listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    let todo = list.findById(todoId);
    if (!todo) {
      next(new Error("Todo item not found."));
    } else {
      todo.toggle();
      if (req.body.done) {
        req.flash("success", `"${todo.getTitle()}" marked complete.`);
      } else {
        req.flash("success", `"${todo.getTitle()}" unchecked.`);
      }
      res.redirect(`/lists/${listId}`);
    }
  }
});


app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  let listId = Number(req.params.todoListId);
  let todoId = Number(req.params.todoId);
  let list = getListFromId(todoLists, listId);

  if (!list) {
    next(new Error("Todo list not found."));
  } else {
    let todo = list.findById(todoId);
    if (!todo) {
      next(new Error("Todo item not found."));
    } else {
      list.removeAt(list.findIndexOf(todo));
      req.flash("success", `"${todo.getTitle()}" removed from list.`);
      res.redirect(`/lists/${listId}`);
    }
  }
});


app.post("/lists/:todoListId/todos",
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to name your todo item.")
      .isLength({ max: 100 })
      .withMessage("Item name must not exceed 100 characters.")
  ],
  (req, res, next) => {
    let id = Number(req.params.todoListId);
    let list = getListFromId(todoLists, id);

    if (!list) {
      next(new Error("Todo list not found."));
    } else {
      let title = req.body.todoTitle;
      let errors = validationResult(req);

      if (!errors.isEmpty) {
        errors.array().forEach(message => req.flash("error", message.msg));
        res.render(`/lists/${id}`, {
          flash: req.flash(),
          todoTitle: title
        });
      } else {
        list.add(new Todo(title));
        req.flash("success", `"${title}" added to list.`);
        res.redirect(`/lists/${id}`);
      }
    }

  }
);


app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("You need to provide a title.")
      .isLength({ max: 100 })
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


app.use((err, _req, res, _next) => {
  console.log(err);
  res.status(404)
     .send(err.message);
});


// Listener
app.listen(PORT, HOST, () => {
  console.log(`Todos listening on port ${PORT} of ${HOST}.`);
});