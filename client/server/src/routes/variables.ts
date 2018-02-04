import { SchoolSchema, intSchoolSchema } from '../schemas/SchoolSchema'; 
import { VariableDefinitionSchema, intVariableDefinitionSchema } from '../schemas/VariableDefinitionSchema';
import { Router, Response, Request, NextFunction } from "express"; 
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
	VariableDefinitionSchema.find()
		.then(resp => {
			return res.json(resp);
		})
		.catch(err => next(err))
});

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise: Promise<any>;
	if (req.body._id) {
		promise = VariableDefinitionSchema.schema.statics.fetchAndUpdate(req.body);
	} else promise = VariableDefinitionSchema.create(req.body);

	promise.then((chart: intVariableDefinitionSchema) => {
		res.json(chart);
		return;
	}).catch((err: Error) => next(err));
});

module.exports = router;