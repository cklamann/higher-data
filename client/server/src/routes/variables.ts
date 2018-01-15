import { SchoolSchema, intSchoolModel } from '../models/School'; 
import { VariableDefinitionSchema, intVariableDefinitionModel } from '../models/VariableDefinition';
import { Router, Response, Request, NextFunction } from "express"; 
import passport = require('passport');

let mongoose = require("mongoose");
let router = Router();
let School = SchoolSchema;

router.get('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	School.schema.statics.getVariableList((err: any, resp: intSchoolModel[]): Response => {
		if (err) next(err);
		return res.json(resp);
	});
});

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	if(!req.body.variable){
		res.sendStatus(400);
	}
	VariableDefinitionSchema.schema.statics.update(req.body.variable, (err:any, variable:intVariableDefinitionModel) => {
		res.json(variable);
	})
});

module.exports = router;