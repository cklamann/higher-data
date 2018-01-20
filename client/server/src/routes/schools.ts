import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema'; 
import { Router, Response, Request, NextFunction } from "express"; 

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/search', function(req, res, next) {
	School.schema.statics.search(req.query.name, (err: any, resp: intSchoolSchema[]): Response => {
		if (err) next(err);
		return res.json(resp);
	});
	return;
});

router.get('/:school/chart/:chart', function(req, res, next) {
	// chart = new Chart(chart,school)
	// return chart.export().then( chart => res.json(chart)); 
	// nb: chart.export() returns a promise, fulfilled when all values are computed
});

module.exports = router;