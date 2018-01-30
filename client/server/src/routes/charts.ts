import { Router, Response, Request, NextFunction } from "express";
import { ChartSchema, intChartSchema } from '../schemas/ChartSchema';
import * as passport from 'passport';

let mongoose = require("mongoose");
let router = Router();

//if exists, update, otherwise create

//  router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
// 	let promise;
// 	 console.log("******************");
// 	 console.log(req.body);
// 	if (req.body._id) {
// 		promise = ChartSchema.schema.statics.update(req.body);
// 	} else promise = ChartSchema.create(req.body);

// 	promise.then((chart: intChartSchema) => {
// 		res.json(chart);
// 		return;
// 	}).catch((err: Error) => next(err));
// });

router.get('/', function(req, res, next): Promise<void> {
	return ChartSchema.find({})
		.then(chart => {
			res.json(chart);
			return;
		}).catch(err => next(err));
});

module.exports = router;