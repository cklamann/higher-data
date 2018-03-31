import { Router, Response, Request, NextFunction } from "express";
import { CategorySchema, intCategorySchema } from '../schemas/CategorySchema';

let mongoose = require("mongoose");
let router = Router();

router.get('/:type', function(req, res, next): Promise<void> {
	return CategorySchema.findOne({"type":req.params.type}).select('-__v')
		.then(cats => {
			res.json(cats);
			return;
		}).catch(err => next(err));
});

module.exports = router;