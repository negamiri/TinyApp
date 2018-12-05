"use strict";

var express = require("express");
var app = express();
var port = 8080; // default port 8080
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase}
  res.render("urls-index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok.");
});

app.get("/urls/:id", (req, res) => {
  var templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id]};
  res.render("urls-show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});