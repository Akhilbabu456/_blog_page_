var createError = require('http-errors');
var express = require('express');
var path = require('path');
const hbs = require("hbs")
var fs = require("fs")
const fileUpload = require('express-fileupload');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var paginate = require('express-paginate');
var flash = require("connect-flash")
var expressMessages = require("express-messages")






var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginformRouter = require("./routes/loginform")
var signupRouter = require("./routes/signup")


var app = express();

// view engine setup
app.use(paginate.middleware(6, 50))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartial(
  "pagination",
  fs.readFileSync(
    path.join(__dirname, "views", "partials", "paginate.hbs"),
    "utf8"
  )
);
hbs.registerPartial(
  "alertMessage",
  fs.readFileSync(
    path.join(__dirname, "views", "partials", "message.hbs"),
    "utf8"
  )
);
hbs.registerHelper("decrement", (value) => {
  return parseInt(value) - 1;
});
hbs.registerHelper("increment", (value) => {
  return parseInt(value) + 1;
});
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    res.redirect("/login"); // Redirect to login page if not logged in
  }
};
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res);
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));
app.use(session({
  secret: 'hello',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // session cookie lasts for 24 hours
}));
app.use(fileUpload());

app.use('/', indexRouter);
app.use("/search", indexRouter)
app.use('/view/:id', indexRouter)
app.use("/login", loginformRouter)
app.use("/signup", signupRouter)
app.use("/user", isAuthenticated, usersRouter)
app.use("/user/search", isAuthenticated, usersRouter)
app.use("/user/setting", isAuthenticated, usersRouter)
app.use("/user/logout", isAuthenticated, usersRouter)
app.use("/user/myblog", isAuthenticated,  usersRouter)
app.use("/user/addblog", isAuthenticated,usersRouter)
app.use("/user/view/:id", isAuthenticated, usersRouter)
app.use("/user/like/:id", isAuthenticated, usersRouter)
app.use("/user/view/:id/delete", isAuthenticated, usersRouter)
app.use("/user/view/:id/update", isAuthenticated, usersRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
