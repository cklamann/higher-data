import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { Router, Response, Request, NextFunction } from "express";
import { ChartExport, intChartExport } from '../models/ChartExporter';
import { ChartSchema } from '../schemas/ChartSchema';
import * as Q from 'q';


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
	let promises: Promise<any>[] = [];
	promises.push(SchoolSchema.schema.statics.fetch(req.params.school));
	promises.push(ChartSchema.findOne({ slug: req.params.chart }).exec());
	Q.all(promises)
		.then(fulfs => {
			const chart = new ChartExport(fulfs[0], fulfs[1]);
			chart.export().then(chart => {
				res.json(chart);
				return;
			}).catch(err => next(err));
		})

});

module.exports = router;