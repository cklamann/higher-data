import { Router, Response, Request, NextFunction } from "express";
var router = Router(),
path = require("path");
 
var absPath = path.join(__dirname, "../public");
 
// route to handle home page
router.get('/', function(req: Request, res: Response, next: NextFunction) {
 res.sendFile(absPath + "/index.html");
});

module.exports = router;