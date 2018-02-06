import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema'; 
import { Router, Response, Request, NextFunction } from "express"; 
import { Chart, intChartExport } from '../models/ChartExporter';


let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/search', function(req, res, next) {
	School.schema.statics.search(req.query.name, (err: any, resp: intSchoolSchema[]): Response => {
		if (err) next(err);
		res.json(resp);
		return;
	});

});

router.get('/:school/charts/:chart', function(req, res, next) {
	const chart = new Chart(req.params.school, req.params.chart)
	 chart.export().then( chart => {
		 res.json(chart);
		 return;
	 }).catch(err=>next(err)); 
});

module.exports = router;