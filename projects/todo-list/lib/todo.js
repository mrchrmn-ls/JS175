const nextId = require("./next-id");

class Todo {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.done = false;
  }

  toString() {
    let marker = this.isDone() ? Todo.DONE_MARKER : Todo.NOT_DONE_MARKER;
    return `[${marker}] - ${this.title}`;
  }

  markDone() {
    this.done = true;
  }

  markNotDone() {
    this.done = false;
  }

  isDone() {
    return this.done;
  }

  getTitle() {
    return this.title;
  }

  setTitle(title) {
    this.title = title;
  }

  getId() {
    return this.id;
  }

}

Todo.DONE_MARKER = "V";
Todo.NOT_DONE_MARKER = " ";

module.exports = Todo;