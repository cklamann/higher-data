import { SchoolDataSchema, intVarExport } from '../schemas/SchoolDataSchema';
import { intSchoolDataQuery, SchoolDataQuery, SchoolDataAggQuery } from '../modules/SchoolDataQuery.module';
import { Router, Response, Request, NextFunction } from "express";
import * as _ from 'lodash';

export interface intSchoolQueryArgs {
	match1var?: string;
	match1vals?: string;
	match2var?: string;
	match2vals?: string;
	match3var?: string;
	match3vals?: string;
	sort?: string;
	order?: string;
	ia?: boolean,
	page?: number,
	perPage?: number
}

let mongoose = require("mongoose");
let router = Router();

//todo: add query vars here and send all requests through, with special type flag for agg query
//start with simple query, then port over aggregate
//set up unit tests before building fe


router.get('/', function(req, res, next): void {
	let promise = null;
	if (req.query.type && req.query.type == "aggregate") {
//		const query = _transformAggQuery(req.query);
//		promise = SchoolDataSchema.schema.statics.fetchAggregate(query);
	} else {
		const query = _transformQuery(req.query);
		promise = SchoolDataSchema.schema.statics.fetch(query);
	}
	promise
		.then((resp: any) => {
			res.json(resp);
			return;
		})
		.catch((err: Error) => next(err));
});

function _transformQuery(args: intSchoolQueryArgs): SchoolDataQuery {
	let qc = SchoolDataQuery.createBase();
	const matches: any = _.filter(args, (v, k) => /^match/.test(k)),
		matchCount = _.values(matches).length;
	for (let i = 1; i == matchCount / 2; i++) {
		qc.addMatch(matches['match' + i + 'var'], matches['match' + i + 'vals'].split(','));
	}
	if(args.page) qc.setPage(args.page);
	if(args.perPage) qc.setPerPage(args.perPage);
	if(args.order) qc.setOrder(args.order);
	if(args.sort) qc.setSortField(args.sort);
	if(args.ia) qc.setInflationAdjusted(args.ia);
	return qc;
}

module.exports = router;