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
      queryParts: object[] = buildMongoAggQuery(qConfig);

    return SchoolDataSchema.aggregate(queryParts)
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
      .then((res) => {
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

const buildMongoAggQuery = (qConfig: SchoolDataAggQuery) => {
  const queryParts = [];

  if (qConfig.getMongoFilters()) queryParts.push(qConfig.getMongoFilters());

  //todo: if no groupby or func, throw 404

  //2 $groups -> first, reduce and groupby, then group results into 'data' array
  queryParts.push({
    $group: {
      _id: {
        [qConfig.getGroupByField()]: "$" + qConfig.getGroupByField(),
        variable: "$variable",
        fiscal_year: "$fiscal_year",
      },
      value: { ["$" + qConfig.getGroupByFunc()]: "$value" },
    },
  });

  queryParts.push({
    $project: {
      [qConfig.getGroupByField()]: "$_id." + qConfig.getGroupByField(),
      variable: "$_id.variable",
      fiscal_year: "$_id.fiscal_year",
      value: "$value",
      _id: 0,
    },
  });

  queryParts.push({
    $group: {
      _id: "$" + qConfig.getGroupByField(),
      data: {
        $addToSet: {
          fiscal_year: "$fiscal_year",
          variable: "$variable",
          value: "$value",
        },
      },
    },
  });

  if (qConfig.getSearchField()) {
    queryParts.push({
      $match: {
        _id: { $regex: qConfig.getSearchField(), $options: "ig" },
      },
    });
  }

  const sortField = _.toNumber(qConfig.getSortField())
    ? qConfig.getSortField()
    : "_id";

  const normalSort = [{ $sort: { [sortField]: qConfig.getSortDirection() } }];

  //since the years by now are distributed in the data arrays we have to sort using a ranked index
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

  queryParts.push({
    $facet: {
      results: [
        ...sortArg,
        { $skip: qConfig.getPageOffset() },
        { $limit: qConfig.getPerPage() },
        {
          $project: { [qConfig.getGroupByField()]: "$_id", data: 1, _id: 0 },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  return queryParts;
};
