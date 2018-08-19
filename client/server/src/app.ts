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
import { UserSchema, intUserSchema } from './schemas/UserSchema';
import * as _ from 'lodash';
const helmet = require('helmet');
const compression = require('compression');

const users = require('./routes/users');
const schools = require('./routes/schools');
const variables = require('./routes/variables');
const charts = require('./routes/charts');
const categories = require('./routes/categories');
const siteContent = require('./routes/siteContent');
const schoolData = require('./routes/schoolData');

if(process.env.ENVI === 'DEV'){
  mongoose.set('debug', true);  
}

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

app.use(cookieParser());

app.use(passport.initialize());

passport.use(new BasicStrategy(
  function(userid: string, password: string, done: any) {
    UserSchema.findOne({ username: userid }, function(err, user) {
      if (err){ 
        return done(err);
      }
      if (!user) return done(null, false);
      if (user.password != password) return done(null, false);
      done(err, user);
    });
  }
));

const userpass = process.env.DB_USERNAME && process.env.DB_PASSWORD ? 
                  process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';

mongoose.connect('mongodb://' + 
                  userpass + 
                  process.env.DB_HOST + ':' +
                  process.env.DB_PORT + '/' +
                  process.env.DB_NAME);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());   

app.use('/api/users', users);
app.use('/api/schools', schools);
app.use('/api/variables', variables);
app.use('/api/charts', charts);
app.use('/api/categories', categories);
app.use('/api/site-content', siteContent);
app.use('/api/school-data', schoolData);

app.use(function(req, res, next) {
  if (req.path.match(/\/api\/.+/)) {
    res.sendStatus(404);
  } else {
    res.sendFile(path.join(__dirname,"public/index.html"), () => {
      return;
    });
  }
});

module.exports = app;