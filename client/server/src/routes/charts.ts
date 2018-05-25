import { Router, Response, Request, NextFunction } from "express";
import { ChartSchema, intChartSchema } from '../schemas/ChartSchema';
import * as passport from 'passport';
import { ChartExport } from '../models/ChartExporter';
import { intSchoolModel } from '../schemas/SchoolSchema';
import { intChartModel } from '../schemas/ChartSchema';
import * as _ from 'lodash';

let mongoose = require("mongoose");
let router = Router();

//if exists, update, otherwise create
router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise: Promise<any>;
	if (req.body._id.length>0) {
		promise = ChartSchema.schema.statics.fetchAndUpdate(req.body);
	} else {
		delete req.body._id;
		promise = ChartSchema.create(req.body);
	}
	promise.then((chart: intChartSchema) => {
		res.json(chart);
		return;
	}).catch((err: Error) => next(err));
});

router.delete('/:id', passport.authenticate('basic', { session: false }), function(req, res, next) {
	ChartSchema.findByIdAndRemove(_.toString(req.params.id))
		.then(resp => {
			if(resp){
				res.status(200).send({message: resp.name + ' successfully deleted!' })
			} else {
				res.status(404).send({message: 'Resource not found!' })
			}
			return;
		})
		.catch(err => next(err));
});

router.post('/preview', passport.authenticate('basic', { session: false }), function(req, res, next) {
	const school:intSchoolModel = req.body.school,
	chart: intChartModel = req.body.chart,
	Chart = new ChartExport(school,chart,{cut:''});
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