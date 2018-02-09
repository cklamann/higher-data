import { Router, Response, Request, NextFunction } from "express";
import { ChartSchema, intChartSchema } from '../schemas/ChartSchema';
import * as passport from 'passport';
import { ChartExport } from '../models/ChartExporter';
import { intSchoolModel } from '../schemas/SchoolSchema';
import { intChartModel } from '../schemas/ChartSchema';

let mongoose = require("mongoose");
let router = Router();

//if exists, update, otherwise create

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise: Promise<any>;
	if (req.body._id) {
		promise = ChartSchema.schema.statics.fetchAndUpdate(req.body);
	} else promise = ChartSchema.create(req.body);

	promise.then((chart: intChartSchema) => {
		res.json(chart);
		return;
	}).catch((err: Error) => next(err));
});

router.post('/preview', passport.authenticate('basic', { session: false }), function(req, res, next) {
	const school:intSchoolModel = req.body.school,
	chart: intChartModel = req.body.chart,
	Chart = new ChartExport(school,chart);
	Chart.export().then(chart => {
		res.json(chart);
		return;
	}).catch(err => next(err));
});

router.get('/', function(req, res, next): Promise<void> {
	return ChartSchema.find({}).select('-__v')
		.then(chart => {
			res.json(chart);
			return;
		}).catch(err => next(err));
});

module.exports = router;