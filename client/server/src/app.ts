import express = require('express');
import { UserSchema, intUserModel } from './models/User'; 
import path = require('path');
const logger = require('morgan'); //need to get types for this...
const cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
const mongoose = require('mongoose');
import passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');

const index = require('./routes/index');
const users = require('./routes/users');
const schools = require('./routes/schools');

mongoose.set('debug', true);

const app = express();

app.use(logger('common', {
	stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

app.use(cookieParser());

app.use(passport.initialize());

passport.use(new BasicStrategy(
	function(username: string, password: string, done: any) {
		UserSchema.findOne({ username: username }, function(err, user) {
			if (err) return done(err);
			if (!user) return done(null, false);
			if (user.password != password) return done(null, false);
			done(err, user);
		});
	}
));

mongoose.connect('mongodb://localhost/colleges');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api/users', users);
app.use('/api/schools', schools);

app.use(function(req, res, next) {
	if (req.path.match(/\/api\/.+/)) {
		res.sendStatus(404);
	} else {
		res.redirect('/');
	}
});

module.exports = app;