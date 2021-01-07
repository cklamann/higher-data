import { model, Schema, Document } from "mongoose";
import { getInflationAdjuster } from "../modules/InflationAdjuster";
import {
  SchoolDataAggQueryArgs,
  SchoolDataAggQuery,
  SchoolDataQuery,
} from "../modules/SchoolDataQuery";
import * as _ from "lodash";

export interface SchoolBaseDataModel {
  fiscal_year: string;
  variable: string;
  value: number;
}

export interface SchoolDataModel extends SchoolBaseDataModel {
  state: string;
  sector: string;
  name: string;
  unitid: string;
}

export interface ExportAgg {
  query: SchoolDataAggQueryArgs;
  data: SchoolDataQueryDataResult[];
}

export interface Export {
  data: SchoolDataSchema[];
  total: number;
}

export interface SchoolDataBaseQueryResult {
  data: SchoolDataSchema[];
  total: number;
}

interface SchoolDataQueryResult {
  totalCount: {
    count: number;
  }[];
  results: SchoolDataQueryDataResult[];
}

interface SchoolDataQueryDataResult {
  sector?: string;
  state?: string;
  data: SchoolBaseDataModel[];
}

export interface SchoolDataSchema extends Document, SchoolDataModel {}

const schoolDataSchema = new Schema({
  fiscal_year: {
    type: String,
    requied: true,
  },
  variable: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    trim: true,
  },
  unitid: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  sector: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

export let SchoolDataSchema = model<SchoolDataSchema>(
  "school_data",
  schoolDataSchema,
  "school_data"
);

//?????????
schoolDataSchema.index(
  { unitid: 1, variable: 1, fiscal_year: 1 },
  { unique: true }
);

SchoolDataSchema.schema.statics = {
  getVariableList: (): Promise<string[]> => {
    return SchoolDataSchema.distinct("variable").exec();
  },

  fetchAggregate: (queryConfig: SchoolDataAggQueryArgs): Promise<ExportAgg> => {

    const qConfig = new SchoolDataAggQuery(queryConfig),
      sortField = _.toNumber(qConfig.getSortField()) ? qConfig.getSortField() : "_id";

    let aggArgs: object[] = [];

    if (qConfig.getMongoFilters()) aggArgs.push(qConfig.getMongoFilters());

    //todo: if no groupby or func, throw 404

    //2 $groups -> first, reduce and groupby, then group results into 'data' array
    aggArgs.push({
      $group: {
        _id: {
          [qConfig.getGroupByField()]: "$" + qConfig.getGroupByField(),
          variable: "$variable",
          fiscal_year: "$fiscal_year",
        },
        value: { ["$" + qConfig.getGroupByFunc()]: "$value" },
      },
    });

    aggArgs.push({
      $project: {
        [qConfig.getGroupByField()]: "$_id." + qConfig.getGroupByField(),
        variable: "$_id.variable",
        fiscal_year: "$_id.fiscal_year",
        value: "$value",
        _id: 0,
      },
    });

    aggArgs.push({
      $group: {
        _id: "$" + qConfig.getGroupByField(),
        data: {
          ["$addToSet"]: {
            fiscal_year: "$fiscal_year",
            variable: "$variable",
            value: "$value",
          },
        },
      },
    });

    if (qConfig.getSearchField()) {
      aggArgs.push({
        $match: {
          _id: { $regex: qConfig.getSearchField(), $options: "ig" },
        },
      });
    }

    let normalSort = [{ $sort: { [sortField]: qConfig.getSortDirection() } }];

    //todo: abstract yearSort into queryConfig object
    //can do a check in there sortFieldIsYear(), verify that it's a valid date

    //here we build an index to rank the values of each entry in the data arrays
    let yearSort = [
      {
        $addFields: {
          idx: {
            $filter: {
              input: "$data",
              as: "val",
              cond: {
                $and: [{ $eq: ["$$val.fiscal_year", sortField] }],
              },
            },
          },
        },
      },

      {
        $addFields: {
          red: {
            $reduce: {
              input: "$idx",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.value"] }, //addToSet on groupby returns array, not val
            },
          },
        },
      },
      {
        $sort: { red: qConfig.getSortDirection() },
      },
    ];

    let sortArg = _.toNumber(sortField) ? yearSort : normalSort;

    aggArgs.push({
      $facet: {
        results: [
          ...sortArg,
          { $skip: qConfig.getPageOffset() },
          { $limit: qConfig.getPageLimit() },
          {
            $project: { [qConfig.getGroupByField()]: "$_id", data: 1, _id: 0 },
          },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    return SchoolDataSchema.aggregate(aggArgs)
      .exec()
      .then((res: SchoolDataQueryResult[]) => {
        let result = res.pop();
        let ret = { query: queryConfig, data: result.results };
        ret.query.pagination.total =
          result.totalCount.length > 0 ? result.totalCount.pop().count : 0;
        if (queryConfig.inflationAdjusted) {
          return getInflationAdjuster().then((adjust) => {
            ret.data.forEach((datum) =>
              datum.data.forEach(
                (item) => (item.value = adjust(item.fiscal_year, item.value))
              )
            );
            return ret;
          });
        } else return ret;
      });
  },

  fetch(query: SchoolDataQuery): Promise<SchoolDataBaseQueryResult> {
    return SchoolDataSchema.find(query.getMongoFilters())
      .count()
      .exec()
      .then((res: any) => {
        return SchoolDataSchema.find(query.getMongoFilters())
          .sort(query.getSortArgs())
          .skip(query.getPageOffset())
          .limit(query.getPerPage())
          .exec()
          .then((resp) => {
            return {
              total: res,
              data: resp,
            };
          });
      });
  },
};
