import { Router, Response, Request, NextFunction } from "express";
import { ChartSchema, intChartModel } from '../models/Chart';
import * as passport from 'passport';

let mongoose = require("mongoose");
let router = Router();

//if exists, update, otherwise create

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise;
	if(req.body._id){
		promise =	ChartSchema.schema.statics.update(req.body)
	} else promise = ChartSchema.create(req.body);

	promise.then( (chart: intChartModel) => {
		res.json(chart);
		return;
	}).catch( (err:Error) => next(err));

});

module.exports = router;