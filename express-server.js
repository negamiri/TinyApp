"use strict";

//Middleware
const express = require("express");
const app = express();
const port = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['userid'],
}))

const urlDatabase = {
  "b2xVn2": {
    longurl: "http://www.lighthouselabs.ca",
    userid: "23ABC"
  },

  "9sm5xK": {
    longurl: "http://www.google.com",
    userid: "45DEF"
  },

  "b2xVUS2": {
    longurl: "http://www.lighthouse.org",
    userid: "23ABC"
  },

  "b2nYn2": {
    longurl: "http://www.lightS.ca",
    userid: "23ABC"
  },
};

const users = {
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

//Check login for valid user
function checkLogin(req) {
  let emailEntered = req.body.email;
  for (let key in users) {
    if (users[key].email.toLowerCase() === emailEntered.toLowerCase() && bcrypt.compareSync(req.body.password, users[key].password)){
      return true;
    }
  }
  return false;
}

//Find user's ID from email address in login
function grabId (email) {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user.id;
    }
  }
}


//Display user's URLs
function urlsForUser (id) {
  let resultObject = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userid === id) {
      let temp = {
        shortURL: url,
        longURL: urlDatabase[url].longurl
      }
      resultObject[url] = temp;
    }
  }
  return resultObject;
}

//Check if user owns URL
function userURL (req) {
  let user = req.session.userid;
  let shorturl = req.params.id;
  if (urlDatabase[shorturl].userid === user){
    return true;
  }
  return false;
}

//Check if short URL exists
function checkShorturl(short) {
  for (let key in urlDatabase){
    if (short === key) {
      return true;
    }
  }
  return false;
}

//Homepage
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//REGISTER AND LOGIN

//Login
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.userid],
  }
  if (templateVars.user){
    res.redirect("/urls");
  } else{
    res.render("login", templateVars);
  }
})

//Create login
app.post('/login', (req, res) => {
  if (req.body["email"] == "" || req.body["password"] == ""){
    res.status('400');
    res.send("Please provide an email and password to login")
  } else if (checkLogin(req)) {
    req.session.userid = grabId(req.body.email);
    res.redirect("/urls/");
  } else {
    res.send("Incorrect password or email entered.")
  }
});

//Log out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(302, "/urls/");
});

//Registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.userid]
  }
  if (templateVars.user){
    res.redirect("/urls")
  } else {
    res.render("registration", templateVars);
  }
});

//Register user in database
app.post("/register", (req, res) => {
  if (req.body.email == "" || req.body.password == ""){
    res.status('400');
    res.send("Please provide an email and password to register")
  } else if (emailTaken(req)) {
      res.status('400');
      res.send("Emaill already in use")
  } else {
      let id = generateRandomString();
      users[id] = {
        "id": id,
        "email": req.body.email,
        "password": bcrypt.hashSync(req.body.password, 10),
      }
      req.session.userid = users[id].id;
      res.redirect("/urls/");
    }
});


//List of all of user's URLs
app.get("/urls", (req, res) => {
  const templateVars = {
      urls: urlsForUser(req.session.userid),
      user: users[req.session.userid]
  };
  if (templateVars.user) {
    res.render("urls-index", templateVars);
  } else {
    res.redirect("/login?e=" + encodeURIComponent("Log in to continue"));
  }
});

//Page for creating new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session.userid] }
  if (templateVars.user) {
    res.render("urls-new", templateVars);
  } else {
    res.redirect("/login?e=" + encodeURIComponent("Log in to continue"));
  }
});


//CREATE short URL
//Redirects to /urls/{shortURL} page to show long and short url
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longurl: longURL,
    userid: req.session.userid
  };
  res.redirect(`/urls/${shortURL}`);
});

//READ short URL and redirect to long URL
app.get("/u/:shortURL", (req, res) => {
  let shorturl = req.params.shortURL;
  let longURL = (urlDatabase[shorturl] || {longurl: '/notfound' }).longurl;
  if (shorturl) {
    res.redirect(longURL);
  } else {
    res.status("404").send('Not found');
  }
});

app.get("/notfound", (req,res) => {
  res.status("400").send("Long URL not found");
})

//View short url
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: (urlDatabase[req.params.id] || {longurl: '/notfound' }).longurl,
    user: users[req.session.userid]
  };
  if (req.session.userid){
    if (userURL(req)) {
      res.render("urls-show", templateVars);
    } else {
      res.send("You do not own this short URL.");
    }
  } else {
    res.status("404").send("Please log in to continue");
  }
});

//UPDATE existing URL
app.post("/urls/:id/update", (req, res) => {
  let shorturl = req.params.id;
  urlDatabase[shorturl].longurl = req.body.longURL;
  res.redirect("/urls");
});

//DELETE existing long url
app.post("/urls/:id/delete", (req, res) => {
  let shorturl = req.params.id;
  delete urlDatabase[shorturl];
  res.redirect("/urls");
});


//To ensure server is running
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});


