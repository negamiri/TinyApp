"use strict";

const express = require("express");
const app = express();
const port = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//READ list of all our URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
                          username: req.cookies["username"]}
  res.render("urls-index", templateVars);
});

//READ form for creating new URLs
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls-new", templateVars);
});

//CREATE login
app.post('/login', (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect(302, "/urls/");
});

//CREATE logout
app.post('/logout', (req, res) => {
  res.clearCookie("username");
  res.redirect(302, "/urls/");
});

//CREATE short URL
//Redirects to /urls/{shortURL} page to show long and short url
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(302, `/urls/${shortURL}`);
});

//READ short URL and redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL;
  let longURL = urlDatabase[shorturl];
  if (shortURL) {
    res.redirect(302, longURL);
  } else {
    res.status('400');
    res.render('notfound');
  }
});

//READ page of short URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"]};
  res.render("urls-show", templateVars);
});

//UPDATE existing URL
app.post("/urls/:id/update", (req, res) => {
  let shorturl = req.params.id;
  let longurl = req.body.longURL;
  urlDatabase[shorturl] = longurl;
  res.redirect(302, "/urls");
});

//DELETE existing long url
app.post("/urls/:id/delete", (req, res) => {
  let shorturl = req.params.id;
  delete urlDatabase[shorturl];
  res.redirect(302, "/urls");
});


// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

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