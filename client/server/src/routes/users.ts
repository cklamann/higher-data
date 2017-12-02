import { Router, Response, Request, NextFunction } from "express";
var router = Router();

/* GET users listing. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.send({res:"I was loaded asynchronously!"});
});

module.exports = router;
