const express = require("express");
const morgan = require("morgan");
const { render } = require("pug");

const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

function sortContacts(contacts) {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.lastName < contactB.lastName) {
      return 1;
    } else {
      return 0;
    }
  });
}

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData)
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

app.post("/contacts/new",
  (req, res, next) => {
    for (param in req.body) {
      req.body[param] = req.body[param].trim();
    }
    next();
  },

  (req, res, next) => {
    res.locals.errorMessages = [];
    next();
  },

  (req, res, next) => {
    let firstName = req.body.firstName;
    if (firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    }
    if (!firstName.match(/^[A-Za-z\s]+$/)) {
      res.locals.errorMessages.push("Only alphabetic characters and space are allowed for names.");
    }
    if (firstName.length > 25) {
      res.locals.errorMessages.push("First name cannot be longer than 25 characters");
    }
    next();
  },

  (req, res, next) => {
    let lastName = req.body.lastName;
    if (lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    }
    if (!lastName.match(/^[A-Za-z\s]+$/)) {
      res.locals.errorMessages.push("Only alphabetic characters and space are allowed for names.");
    }
    if (lastName.length > 25) {
      res.locals.errorMessages.push("Last name cannot be longer than 25 characters.");
    }
    next();
  },

  (req, res, next) => {
    contactData.forEach(contact => {
      if ((contact.firstName === req.body.firstName) && (contact.lastName === req.body.lastName)) {
        res.locals.errorMessages.push(`${contact.firstName} ${contact.lastName} already exists.`)
      }
    });
    next();
  },

  (req, res, next) => {
    let phoneNumber = req.body.phoneNumber;
    if (phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    }
    if (!phoneNumber.match(/\d{3}-\d{3}-\d{4}/)) {
      res.locals.errorMessages.push("Phone number must have US standard format ###-###-####.");
    }
    next();
  },

  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber
      });
    } else {
      next();
    }
  },

  (req, res) => {
    contactData.push({ ...req.body });
    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000...");
});