/* eslint-disable max-lines-per-function */
const express = require("express");
const morgan = require("morgan");
const TodoList = require("./lib/todolist");

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

// return copy of lists array sorted by list titles
function sortTodoLists(lists) {
  return lists.slice()
              .sort((listA, listB) => {
                let titleA = listA.getTitle().toLowerCase();
                let titleB = listB.getTitle().toLowerCase();

                if (titleA > titleB) return 1;
                else if (titleA < titleB) return -1;
                else return 0;
              })
              .sort((listA, listB) => {
                if (listA.isDone() && !listB.isDone()) return 1;
                else if (!listA.isDone() && listB.isDone()) return -1;
                else return 0;
              });
}

app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", { todoLists: sortTodoLists(todoLists) });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

app.post("/lists", (req, res) => {
  let title = req.body.todoListTitle.trim();
  if (title.length === 0) {
    res.render("new-list", {
      errorMessage: "You need to provide a title."
    });
  } else if (title.length > 100) {
    res.render("new-list", {
      errorMessage: "Title must be shorter than 100 characters.",
      todoListTitle: title
    });
  } else if (todoLists.some(list => list.getTitle() === title)) {
    res.render("new-list", {
      errorMessage: "A list with this title already exists.",
      todoListTitle: title
    });
  } else {
    todoLists.push(new TodoList(title));
    res.redirect("/lists");
  }
});

// Listener
app.listen(PORT, HOST, () => {
  console.log(`Todos listening on port ${PORT} of ${HOST}.`);
});