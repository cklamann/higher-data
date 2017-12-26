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
	stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
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
app.use('/api/users', users);
app.use('/api/schools', schools);

//route all traffic from the app to index for router to handle...
app.use(function(req, res, next) {
	if (req.path.match(/\/api\/.+/)) {
		res.status(404).send('Sorry, we couldn\'t find that!');
		//let err = new Error('Not Found');
		//next(err); //note -- this will show stack trace
	} else {
		res.redirect('/');
	}
});



module.exports = app;
