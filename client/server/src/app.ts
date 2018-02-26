import * as express from 'express';
import * as path from 'path';
const logger = require('morgan');
const cookieParser = require('cookie-parser');
import * as bodyParser from 'body-parser';
const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
import * as passport from 'passport';
const BasicStrategy = require('passport-http').BasicStrategy;
const fs = require('fs');
import * as winston from 'winston';
import { UserSchema, intUserSchema } from './schemas/UserSchema';
import { SchoolSchema, intSchoolSchema } from './schemas/SchoolSchema';
import * as _ from 'lodash';

const users = require('./routes/users');
const schools = require('./routes/schools');
const variables = require('./routes/variables');
const charts = require('./routes/charts');

mongoose.set('debug', true);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/favicon.ico', function(req,res,next) {
  res.sendStatus(404); 
});

app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

app.use(cookieParser());

app.use(passport.initialize());

passport.use(new BasicStrategy(
  function(userid: string, password: string, done: any) {
    UserSchema.findOne({ username: userid }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (user.password != password) return done(null, false);
      done(err, user);
    });
  }
));

mongoose.connect('mongodb://localhost/colleges');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/users', users);
app.use('/api/schools', schools);
app.use('/api/variables', variables);
app.use('/api/charts', charts);

app.use(function(req, res, next) {
  if (req.path.match(/\/api\/.+/)) {
    res.sendStatus(404);
  } else {
    let queryVars = [];
    _.forEach(req.query, (v, k) => queryVars.push(`${k}=${v}`));
    queryVars.join("&");

    let path = (queryVars) ? req.path + ("?" + queryVars) : req.path 
    res.cookie("redirect", path);
    res.redirect('/index.html');
  }
});

module.exports = app;