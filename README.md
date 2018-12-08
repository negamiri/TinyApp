# TinyApp project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs. Users can also update and delete their existing shortened URLs.

## Functionality
* User will need to create an account.
* After creating an account, user will be able to see the URLs page.
* The URLs page contains all of the user's URLs.
* From the URLs page, the user can create a new short URL or edit/delete existing URLs.
* The user can access the long URL from the short URL via "/u/:shorturl"
* Once the user logs out, they session cookie will be wiped and they'll be required to log back in to access, edit and delete their URLs.

## Final product

### Screenshot: URLs page
User can view their short URLs when they're logged in

!["Screenshot: URLs page"](https://github.com/negamiri/TinyApp/blob/master/docs/urls-page.png?raw=true)

### Screenshot: Editing a URL
User can edit their short URLs when logged in

!["Screenshot: Editing a URL"](https://github.com/negamiri/TinyApp/blob/master/docs/edit-url.png?raw=true)

## Dependencies
* Node.js
* Express
* EJs
* bcrypt
* Body-parser
* cookie-session

## Getting started
* Install all dependencies (using the `npm install` command)
* Run the development web server using the `node express_server.js` command
