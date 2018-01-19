import { SchoolSchema, intSchoolModel } from '../models/School'; 
import { Router, Response, Request, NextFunction } from "express"; 

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/search', function(req, res, next) {
	School.schema.statics.search(req.query.name, (err: any, resp: intSchoolModel[]): Response => {
		if (err) next(err);
		return res.json(resp);
	});
	return;
});

module.exports = router;