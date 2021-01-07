import { SchoolDataSchema } from "../schemas/SchoolDataSchema";
import {
  Filter,
  SchoolDataQuery,
  SchoolDataAggQuery,
} from "../modules/SchoolDataQuery";
import { Router, Request } from "express";
import { get } from "lodash";

export interface SchoolQueryParams {
  filters?: string;
  inflationAdjusted?: string;
  order?: string;
  page?: string;
  perPage?: string;
  search?: string;
  sort?: string;
  type?: string;
}

export interface SchoolAggQueryArgs extends SchoolQueryParams {
  gbField: "state" | "sector";
  gbFunc: "sum" | "average";
}

let router = Router();

type SchoolDataRequest<T> = Request<{ [key: string]: any }, any, any, T>;

router.get("/", function (
  req: SchoolDataRequest<SchoolQueryParams>,
  res,
  next
) {
  const query = _transformQueryParams(req.query, new SchoolDataQuery({}));
  SchoolDataSchema.schema.statics
    .fetchAggregate(query)
    .then((res: any) => res.json(res))
    .catch((err: Error) => next(err));
});

router.get(
  "/aggregate",
  (req: SchoolDataRequest<SchoolAggQueryArgs>, res, next) => {
    const query = _transformAggQueryParams(
      req.query,
      new SchoolDataAggQuery({})
    );
    SchoolDataSchema.schema.statics
      .fetchAggregate(query)
      .then((resp: any) => res.json(resp))
      .catch((err: Error) => next(err));
  }
);

const _transformAggQueryParams = (
  args: SchoolAggQueryArgs,
  query: SchoolDataAggQuery
) => {
  let qcF = _transformQueryParams(args, query) as SchoolDataAggQuery;
  qcF.setGroupBy(args.gbField, args.gbFunc);
  return qcF;
};

const _transformQueryParams = (
  args: SchoolAggQueryArgs | SchoolQueryParams,
  query: SchoolDataAggQuery | SchoolDataQuery
) => {
  //filters=name:gt:foo|value:eq:bar
  if (args.filters) {
    const filters = _getFiltersFromQueryString(args.filters);
    Object.keys(filters).forEach((filter) => {
      query.addFilter(filter, filters[filter]);
    });
  }
  if (args.page) query.setPage(+args.page);
  if (args.perPage) query.setPerPage(+args.perPage);
  if (args.order) query.setOrder(args.order);
  if (args.sort) query.setSortField(args.sort);
  if (args.inflationAdjusted)
    query.setInflationAdjusted(args.inflationAdjusted);
  if (args.search) query.setSearchField(args.search);
  return query;
};

const _getFiltersFromQueryString = (stringPart: string) =>
  stringPart
    .split("|")
    .map((filter) => {
      const parts = filter.split(":");
      return {
        field: get(parts, "[0]"),
        comparator: get(parts, "[1]"),
        value: get(parts, "[2]"),
      };
    })
    .filter((v) => {
      if (!v.field || !v.comparator || !v.value) {
        return false;
      }
    })
    .reduce(
      (a, c) => ({
        ...a,
        ...{
          [c.field]: {
            comparator: c.comparator,
            value: c.value,
          },
        },
      }),
      {} as Record<string, Filter>
    );

module.exports = router;
