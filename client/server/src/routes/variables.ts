import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema';
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { Router, Response, Request, NextFunction } from "express";
import { intChartModel } from '../schemas/ChartSchema';
import { ChartExport } from '../models/ChartExporter';
import * as passport from 'passport';

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/fetch_names', passport.authenticate('basic', { session: false }), function(req, res, next) {
	School.schema.statics.getVariableList((err: any, resp: string[]): Response => {
		if (err) next(err);
		return res.json(resp);
	});
});

router.get('/fetch_by_name', function(req, res, next) {
	VariableDefinitionSchema.findOne({ variable: req.query.name }).select("-__v")
		.then(resp => {
			res.json(resp);
			return;
		})
		.catch(err => next(err));
});

router.get('/', function(req, res, next) {
	let filter = req.query.defined ? {'sources.0':{$exists: true}} : {};
	console.log(filter);
	VariableDefinitionSchema.find(filter)
		.then(resp => {
			return res.json(resp);
		})
		.catch(err => next(err))
});

router.get('/:variable/chart/:school', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let chartModel: intChartModel = {
		name: "preview",
		slug: "preview",
		type: "line",
		category: "test",
		active: true,
		valueType: "decimal2",
		description: "test",
		variables: [{
			formula: req.params.variable,
			notes: "test",
			legendName: req.params.variable
		}],
		cuts:[]
	}

	SchoolSchema.schema.statics.fetch(req.params.school)
		.then((school: intSchoolSchema) => {
			const chart = new ChartExport(school, chartModel,{cut:''});
			chart.export().then(chart => {
				res.json(chart);
				return;
			}).catch(err => next(err));
		})
});

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise: Promise<any>;
	if (req.body._id){
		promise = VariableDefinitionSchema.schema.statics.fetchAndUpdate(req.body);
	} else {
		promise = VariableDefinitionSchema.create(req.body);
	}

	promise.then((chart: intVariableDefinitionSchema) => {
		res.json(chart);
		return;
	}).catch((err: Error) => next(err));
});

module.exports = router;