require("dotenv").config();
import * as express from "express";
import * as path from "path";
const logger = require("morgan");
const cookieParser = require("cookie-parser");
import * as bodyParser from "body-parser";
const mongoose = require("mongoose");
mongoose.Promise = require("q").Promise;
import * as passport from "passport";
const BasicStrategy = require("passport-http").BasicStrategy;
const fs = require("fs");
import { UserSchema } from "./schemas/UserSchema";
import * as _ from "lodash";
const http = require("http");

const users = require("./routes/users"),
  schools = require("./routes/schools"),
  variables = require("./routes/variables"),
  charts = require("./routes/charts"),
  categories = require("./routes/categories"),
  siteContent = require("./routes/siteContent"),
  schoolData = require("./routes/schoolData");

if (process.env.ENVI === "DEV") {
  mongoose.set("debug", true);
}

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(
  logger("common", {
    stream: fs.createWriteStream(path.join(__dirname, "access.log"), {
      flags: "a",
    }),
  })
);

app.use(cookieParser());

app.use(passport.initialize());

passport.use(
  new BasicStrategy(function (userid: string, password: string, done: any) {
    UserSchema.findOne({ username: userid }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) return done(null, false);
      if (user.password != password) return done(null, false);
      done(err, user);
    });
  })
);

const connection = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log("**********connection: " + connection);

mongoose.connect(connection, { useNewUrlParser: true }).catch((err: any) => {
  console.log(err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/users", users);
app.use("/api/schools", schools);
app.use("/api/variables", variables);
app.use("/api/charts", charts);
app.use("/api/categories", categories);
app.use("/api/site-content", siteContent);
app.use("/api/school-data", schoolData);

app.use(function (req, res, next) {
  if (req.path.match(/\/api\/.+/)) {
    res.sendStatus(404);
  } else {
    res.sendFile(path.join(__dirname, "public/index.html"), () => {
      return;
    });
  }
});

const port = normalizePort(process.env.APP_PORT);
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}
