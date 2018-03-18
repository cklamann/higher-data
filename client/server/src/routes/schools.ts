import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { Router, Response, Request, NextFunction } from "express";
import { ChartExport, intChartExport } from '../models/ChartExporter';
import { ChartSchema } from '../schemas/ChartSchema';
import { FormulaParser, intFormulaParserResult } from '../modules/FormulaParser.module';
import * as Q from 'q';

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/search', function(req, res, next) {
	School.schema.statics.search(req.query.name)
		.then((resp: intSchoolSchema[]) => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
});

router.get('/:id', function(req, res, next) {
	School.findOne({ unitid: req.params.id }).select('-data')
		.then(school => {
			res.json(school);
			return;
		})
		.catch(err => next(err));
});

router.get('/:school/charts/:chart', function(req, res, next) {
	const promises: Promise<any>[] = [],
		options = req.query ? req.query : {};
	promises.push(SchoolSchema.schema.statics.fetch(req.params.school));
	promises.push(ChartSchema.findOne({ slug: req.params.chart }).exec());
	Q.all(promises)
		.then(fulfs => {
			const chart = new ChartExport(fulfs[0], fulfs[1], options);
			chart.export().then(chart => {
				res.json(chart);
				return;
			}).catch(err => next(err));
		})

});

//todo: not in use, but could be handy in the future for ad-hoc chart formula parsing
router.post('/chart/:school', function(req, res, next): void {
	SchoolSchema.schema.statics.fetch(req.params.school)
		.then((school: intSchoolSchema) => {
			let formula = new FormulaParser(req.body.formula);
			if (!formula.validate()) next(new Error("formula invalid"));
			return formula.execute(school.unitid);
		})
		.then((resp: intFormulaParserResult) => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
})

module.exports = router;