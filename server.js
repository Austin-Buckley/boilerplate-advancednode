"use strict";
require("dotenv").config();
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");

const app = express();
const session = require("express-session");
const passport = require("passport");
const { ObjectID } = require("mongodb");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const routes = require("./routes.js");
const auth = require("./auth.js");

app.set("view engine", "pug");
app.set("views", "./views/pug");
fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

passport.initialize();
passport.session();
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");

  routes(app, myDataBase);
  auth(app, myDataBase);
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("index", { title: e, message: "Unable to connect to database" });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
