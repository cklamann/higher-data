//for now will just need get and post routes for creating, updating, and fetching
//for updating, use the same pattern as in VariableDefinition
import { Router, Response, Request, NextFunction } from "express";
import { ChartSchema } from '../models/Chart';
import * as passport from 'passport';

let mongoose = require("mongoose");
let router = Router();

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	ChartSchema.create(req.body.chartData)
		.then( model => {
			res.json(model);
		})
		.catch( err => next(err));
});

module.exports = router;