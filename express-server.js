"use strict";

let express = require("express");
let app = express();
let port = 8080; // default port 8080
let bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

let urlDatabase = {
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
  let templateVars = { urls: urlDatabase}
  res.render("urls-index", templateVars);
});

//Form for creating short URL
app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

//After filling in form:
//Adds long and short URL to URLdatabase
//Redirects to /urls/{shortURL} page to show long and short url
app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(301, `/urls/${shortURL}`);
});

//Takes short URL and redirects to long URL
app.get("/u/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL;
  let longURL = urlDatabase[shorturl];
  res.redirect(301, longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id]};
  res.render("urls-show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//To ensure server is running
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

//Create a random string for short url
//Limitations: could be a duplicate as we're not checking for existing values
function generateRandomString () {
  let string = ('123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  let randomString = '';
  for (let i = 0; i < 6; i++){
    randomString += string.charAt(Math.floor(Math.random() * string.length));
  }
  return randomString;
}