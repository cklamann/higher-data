import { Router, Response, Request, NextFunction } from "express";
let router = Router(),
	path = require("path"),
	absPath = path.join(__dirname, "/public");
 
// route to handle home page
router.get('/', function(req, res, next) {
 res.sendFile(absPath + "/index.html");
});

module.exports = router;