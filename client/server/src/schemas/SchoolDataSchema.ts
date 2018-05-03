import { model, Schema, Document, Model } from 'mongoose';
import { intQueryConfig } from '../types/types';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';
import * as _ from 'lodash';

export interface intSchoolBaseDataModel {
  fiscal_year: string,
  variable: string,
  value: number
}

export interface intSchoolDataModel extends intSchoolBaseDataModel {
  state: string,
  sector: string,
  instnm: string,
  unitid: string
};

export interface intVarExport {
  query: intQueryConfig;
  data: intSchoolDataQueryDataResult[];
}

interface intSchoolDataQueryResult {
  totalCount: {
    count: number,
  }[],
  results: intSchoolDataQueryDataResult[]
}

interface intSchoolDataQueryDataResult {
  instnm: string,
  data: intSchoolBaseDataModel[]
}

export interface intSchoolDataSchema extends Document, intSchoolDataModel { };

const schoolDataSchema = new Schema({
  fiscal_year: {
    type: String,
    requied: true,
  },
  variable: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true,
    trim: true
  },
  unitid: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  sector: {
    type: String,
    required: true,
    trim: true
  },
  instnm: {
    type: String,
    required: true,
    trim: true
  }
});

export let SchoolDataSchema = model<intSchoolDataSchema>('school_data', schoolDataSchema, 'school_data');

SchoolDataSchema.schema.statics = {

  getVariableList: (): Promise<string[]> => {
    return SchoolDataSchema.distinct('variable').exec();
  },

  fetchAggregate: (queryConfig: intQueryConfig): Promise<intVarExport> => {

    const sd = queryConfig.sort.direction === "-" ? -1 : 1,
      sf = _.toNumber(queryConfig.sort.field) ? queryConfig.sort.field : "_id",
      start = (queryConfig.pagination.page * queryConfig.pagination.perPage) - queryConfig.pagination.perPage,
      stop = queryConfig.pagination.perPage,
      groupByFuncName = queryConfig.groupBy.aggFunc ? queryConfig.groupBy.aggFunc : "sum",
      groupByField = queryConfig.groupBy.variable ? queryConfig.groupBy.variable : "instnm",
      matches = queryConfig.matches.filter(match => match);

    // todo: if this has to be used elsewhere, make its own object: 
    // qC = newQueryConfig(queryConfig)
    // then qC.verify(), aggArgs.push(qC.getMatches()), aggArgs.push(qC.getSort()), etc. 

    let aggArgs: object[] = [];

    //filter out unneeded fields
    aggArgs.push({
      "$match": {
        "$and": matches.concat([{ "variable": { "$in": queryConfig.filters.values } }])
      }
    });

    //2 $groups -> first, reduce and groupby (if there's an aggFunc), then group into 'data' array
    aggArgs.push({
      "$group": {
        "_id": {
          [groupByField]: "$" + groupByField, 'variable': '$variable', 'fiscal_year': '$fiscal_year'
        },
        "value": { ['$' + groupByFuncName]: '$value' }
      }
    });

    aggArgs.push({
      $project: {
        [groupByField]: "$_id." + groupByField,
        'variable': '$_id.variable',
        'fiscal_year': '$_id.fiscal_year',
        'value': '$value',
        '_id': 0
      }
    });

    aggArgs.push({
      "$group": {
        "_id":
          "$" + groupByField,
        "data": { ["$addToSet"]: { "fiscal_year": "$fiscal_year", "variable": "$variable", "value": "$value" } }
      }
    });

    //sort
    let normalSort = [{ "$sort": { [sf]: sd } }];

    let yearSort = [
      {
        $addFields: {
          'idx': {
            '$filter': {
              input: "$data",
              as: "val",
              cond: {
                $and: [
                  { "$eq": ["$$val.fiscal_year", sf] },
                  { "$eq": ["$$val.variable", queryConfig.filters.values[0]] }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          'red': {
            '$reduce': {
              input: "$idx",
              initialValue: 0,
              in: { "$sum": ["$$value", "$$this.value"] }
            }
          }
        }
      },
      {
        $sort: { 'red': sd }
      }
    ]

    let sortArg = _.toNumber(sf) ? yearSort : normalSort;

    aggArgs.push({
      $facet: {
        results: [...sortArg, { "$skip": start }, { "$limit": stop }, { "$project": { [queryConfig.groupBy.variable]: '$_id', data: 1, '_id': 0 } }],
        totalCount: [{ $count: 'count' }]
      }
    });

    return SchoolDataSchema.aggregate(aggArgs).exec()
      .then((res: intSchoolDataQueryResult[]) => {
        let result = res.pop();
        let ret = { query: queryConfig, data: result.results };
        ret.query.pagination.total = result.totalCount.length > 0 ? result.totalCount.pop().count : 0;
        if (queryConfig.inflationAdjusted == "true") {
          return getInflationAdjuster().then(adjust => {
            ret.data.forEach(datum => datum.data.forEach(item => item.value = adjust(item.fiscal_year, item.value)))
            return ret
          });
        } else return ret;
      });
  }

}