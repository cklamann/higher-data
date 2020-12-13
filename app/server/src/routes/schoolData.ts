import { SchoolDataSchema } from "../schemas/SchoolDataSchema";
import {
  SchoolDataQuery,
  SchoolDataAggQuery,
} from "../modules/SchoolDataQuery.module";
import { Router } from "express";
import { pickBy } from "lodash";

export interface SchoolQueryArgs {
  qField?: string;
  qVal?: string;
  match1var?: string;
  match1vals?: string;
  match2var?: string;
  match2vals?: string;
  match3var?: string;
  match3vals?: string;
  match4var?: string;
  match4vals?: string;
  sort?: string;
  order?: string;
  ia?: string;
  page?: string;
  perPage?: string;
  type?: string;
}

export interface SchoolAggQueryArgs extends SchoolQueryArgs {
  gbField: "state" | "sector";
  gbFunc: "sum" | "average";
}

let router = Router();

router.get("/", function (req, res, next) {
  let promise = null;
  //todo: use typeguard
  if (req.query.type && req.query.type != "aggregate") {
    const query = _transformQuery(req.query);
    promise = SchoolDataSchema.schema.statics.fetch(query);
  } else {
    const query = _transformAggQuery(
      (req.query as unknown) as SchoolAggQueryArgs
    );
    promise = SchoolDataSchema.schema.statics.fetchAggregate(query);
  }
  promise
    .then((resp: any) => {
      res.json(resp);
      return;
    })
    .catch((err: Error) => next(err));
});

function _transformQuery(args: SchoolQueryArgs): SchoolDataQuery {
  let qc = SchoolDataQuery.createBase();
  return _setBaseQueryArgs(args, qc);
}

function _transformAggQuery(args: SchoolAggQueryArgs): SchoolDataAggQuery {
  let qc = SchoolDataAggQuery.createAgg();
  let qcF = <SchoolDataAggQuery>_setBaseQueryArgs(args, qc);
  qcF.setGroupBy(args.gbField, args.gbFunc);
  return qcF;
}

function _setBaseQueryArgs(
  args: SchoolAggQueryArgs | SchoolQueryArgs,
  qc: SchoolDataAggQuery | SchoolDataQuery
): SchoolDataQuery | SchoolDataAggQuery {
  const matches: any = pickBy(args, (v, k) => /^match/.test(k)),
    matchCount = Object.values(matches).length / 2;
  for (let i = 1; i <= matchCount; i++) {
    qc.addMatch(
      matches["match" + i + "var"],
      matches["match" + i + "vals"].split(",")
    );
  }
  if (args.qVal && args.qField) qc.setNameFilter(args.qField, args.qVal);
  if (args.page) qc.setPage(+args.page);
  if (args.perPage) qc.setPerPage(+args.perPage);
  if (args.order) qc.setOrder(args.order);
  if (args.sort) qc.setSortField(args.sort);
  if (args.ia) qc.setInflationAdjusted(args.ia);
  return qc;
}

module.exports = router;
