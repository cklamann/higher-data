import express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');
var schools = require('./routes/schools');


mongoose.set('debug', true);


var app = express();

app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
}));


app.use(cookieParser());


// passport config
// http://mherman.org/blog/2015/01/31/local-authentication-with-passport-and-express-4/#.WiLqqN-YUso
app.use(passport.initialize());
app.use(passport.session());
app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

var Account = require('./models/Account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
//mongoose.connect('mongodb://localhost/passport_local_mongoose_express4');
mongoose.connect('mongodb://localhost/colleges');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/schools', schools);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  var err = new Error('Not Found');
  next(err);
});

// error handler
app.use(function(err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

});

module.exports = app;
