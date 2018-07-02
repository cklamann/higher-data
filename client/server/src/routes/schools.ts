import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { SchoolDataSchema, intVarExport } from '../schemas/SchoolDataSchema';
import { intQueryConfig } from '../types/types';
import { Router, Response, Request, NextFunction } from "express";
import { ChartExport, intChartExport } from '../models/ChartExporter';
import { ChartSchema } from '../schemas/ChartSchema';
import { FormulaParser, intFormulaParserResult } from '../modules/FormulaParser.module';
import * as Q from 'q';

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/', function(req, res, next) {
	School.schema.statics.search(req.query.q)
		.then((resp: intSchoolSchema[]) => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
});

router.get('/:id', function(req, res, next) {
	School.findOne({ unitid: req.params.id })
		.then(school => {
			res.json(school);
			return;
		})
		.catch(err => next(err));
});

router.get('/:schoolSlug/charts/:chartSlug', function(req, res, next) {
	const promises: Promise<any>[] = [],
		options = req.query ? req.query : {};
	promises.push(SchoolSchema.schema.statics.fetch(req.params.schoolSlug));
	promises.push(ChartSchema.findOne({ slug: req.params.chartSlug }).exec());
	Q.all(promises)
		.then(fulfs => {
			const chart = new ChartExport(fulfs[0], fulfs[1], options);
			chart.export().then(chart => {
				res.json(chart);
				return;
			}).catch(err => next(err));
		});
});

//todo: this should use an include on show route rather than have its own route (convert to get request)
router.post('/aggregateQuery', function(req, res, next): void {
	let params: intQueryConfig = req.body;
	SchoolDataSchema.schema.statics.fetchAggregate(params)
		.then((resp: intVarExport) => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
});

module.exports = router;