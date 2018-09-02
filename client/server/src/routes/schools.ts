import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { SchoolDataSchema, intExportAgg } from '../schemas/SchoolDataSchema';
import { intSchoolDataAggQuery } from '../modules/SchoolDataQuery.module';
import { Router, Response, Request, NextFunction } from "express";
import { ChartExport, intChartExport } from '../modules/ChartExporter.module';
import { ChartSchema } from '../schemas/ChartSchema';
import { FormulaParser, intFormulaParserResult } from '../modules/FormulaParser.module';
import * as Q from 'q';
import * as _ from 'lodash'
;
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
	School.findOne({ unitid: _.toNumber(req.params.id) })
		.then(school => {
			console.log(school);
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

module.exports = router;