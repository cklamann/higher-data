import { Router, Response, Request, NextFunction } from "express";
let router = Router();
import path = require("path");

//let publicPath = path.join(__dirname, "/public");

let publicPath = "/var/www/html/noder/client/server/dist/public";

// route to handle home page

router.get('/', function(req, res, next) { 
	res.sendFile(publicPath + "/index.html");
});

router.get('/', function(req, res, next) {
	console.log("i got called");
	res.sendFile("../../dist/public/index.html");
});

module.exports = router;