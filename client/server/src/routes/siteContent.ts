import { SiteContentSchema, intSiteContentSchema } from '../schemas/SiteContentSchema';
import { Router, Response, Request, NextFunction } from 'express';
import * as passport from 'passport';

let mongoose = require('mongoose');
let router = Router();

router.get('/', function(req, res, next) {
	SiteContentSchema.find().exec()
		.then((content: intSiteContentSchema[]) => {
			res.json(content);
			return;
		})
		.catch((err: Error) => next(err));
});

router.post('/', passport.authenticate('basic', { session: false }), function(req, res, next) {
	let promise: Promise<any>;
	//todo: put this logic in app-wide transformer
	if (req.body._id.length > 1) {
		promise = SiteContentSchema.schema.statics.fetchAndUpdate(req.body);
	} else {
		delete req.body._id;
		promise = SiteContentSchema.create(req.body);
	}

	promise.then((content: intSiteContentSchema) => {
		res.json(content);
		return;
	}).catch((err: Error) => next(err));
});

router.delete('/:id', passport.authenticate('basic', { session: false }), function(req, res, next) {
	SiteContentSchema.deleteOne({ _id: req.params.id })
		.then(resp => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
});

module.exports = router;