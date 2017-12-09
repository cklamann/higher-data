import { SchoolSchema, intSchoolModel } from '../models/School'; // get types using import
import { Router, Response, Request, NextFunction } from "express"; //ditto, though kind pointless now

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

//todo: put text index on school name: https://docs.mongodb.com/manual/text-search/
router.get('/search', function(req, res, next) {
	School.schema.statics.search(req.query.name, (err: any, resp: intSchoolModel[]): Response => {
		if (err) next(err);
		return res.json(resp);
	});
	return;
});

module.exports = router;