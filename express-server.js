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

let users = {
  "23ABC": {
    id: "23ABC",
    email: "user@example.com",
    password: "user123"
  },
  "45DEF": {
    id: "45DEF",
    email: "user@test.com",
    password: "test2343"
  }
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
  const templateVars = { urls: urlDatabase }
  res.render("urls-index", templateVars);
});

//READ form for creating new URLs
app.get("/urls/new", (req, res) => {
  res.render("urls-new");
});

//READ login
app.get("/login", (req, res) => {
  res.render("login")
})

//CREATE username
app.post('/login', (req, res) => {
  if (req.body["email"] == "" || req.body["password"] == ""){
    res.status('400');
    res.send("Please provide an email and password to login")
  } else if (checkLogin(req)) {
    res.cookie("userid", grabId(req.body.email));
    res.redirect(302, "/urls/");
  } else {
    res.redirect('/login')
  }
});

//CREATE logout
// app.post('/logout', (req, res) => {
//   res.clearCookie("userid");
//   res.redirect(302, "/urls/");
// });


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
  if (shorturl) {
    res.redirect(302, longURL);
  } else {
    res.status('404');
    res.render('notfound');
  }
});

//READ page of short URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id]};
  res.render("urls-show", templateVars);
});

//READ registration page
app.get("/register", (req, res) => {
  res.render("registration");
});

//CREATE registration
app.post("/register", (req, res) => {
  if (req.body["email"] == "" || req.body["password"] == ""){
    res.status('400');
    res.send("Please provide an email and password to register")
  } else if (emailTaken(req)) {
      res.status('400');
      res.send("Emaill already in use")
  } else {
      let id = generateRandomString();
      users[id] = {
        "id": id,
        "email": req.body["email"],
        "password": req.body["password"],
  }
  res.cookie("userid", users[id].id);
  res.redirect(302, "/urls/");
  }
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

//Check if email has been taken
function emailTaken(req) {
  let emailEntered = req.body.email;
  for (let key in users){
    if (users[key].email.toLowerCase() === emailEntered.toLowerCase()) {
      return true;
    }
  }
  return false;
}

function checkLogin(req) {
  let emailEntered = req.body.email;
  let passwordEntered = req.body.password;
  for (let key in users) {
    if (users[key].email.toLowerCase() === emailEntered.toLowerCase() && users[key].password === passwordEntered){
      return true;
    }
  }
  return false;
}

function grabId (email) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user.id;
    }
  }
}