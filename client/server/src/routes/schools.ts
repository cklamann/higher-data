import { SchoolSchema, intSchoolModel } from '../schemas/SchoolSchema'; 
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

router.get('/:school/chart/:chart', function(req, res, next): Promise<void> {
	// get school schema from slug OR unitid (since api is better with unitid)
	// get chart schema from chart slug 
	// $q.all([school,chart]);
	// new up chart model with both schema as args
	// chart = new Chart(chart,school)
	// return chart.export(); 
	// nb: chart.export() returns a promise, fulfilled when all values are computed
});

module.exports = router;