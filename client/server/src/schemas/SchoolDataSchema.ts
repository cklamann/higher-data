import { model, Schema, Document, Model } from 'mongoose';
import { intQueryConfig } from '../types/types';
import { getInflationAdjuster } from '../../src/modules/InflationAdjuster.service';
import * as _ from 'lodash';

export interface intSchoolBaseDataModel {
  fiscal_year: string,
  variable: string,
  value: number
}

export interface intSchoolDataModel extends intSchoolBaseDataModel {
  unitid: string,
  state: string,
  sector: string,
  instnm: string,
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

  getVariableList: (): Promise<string[]> => SchoolDataSchema.distinct('variable').exec(),

  fetchWithSchoolNames: (queryConfig: intQueryConfig): Promise<intVarExport> => {

    const sd = queryConfig.sort.direction === "-" ? -1 : 1,
      sf = queryConfig.sort.field ? queryConfig.sort.field : "_id", //instnm in this case, every time
      start = (queryConfig.pagination.page * queryConfig.pagination.perPage) - queryConfig.pagination.perPage,
      stop = queryConfig.pagination.perPage;

    //todo: qC = new QueryConfig(queryConfig)

    // then can do magic like aggArgs.push(qC.getMatches()), aggArgs.push(qC.getSort()), etc. 
    // this gives you control over order, which is most important. Brilliant!
    // might wanna do some manual runs, first, here and on agg, then abstract and apply to degrees

    let aggArgs: object[] = [];

    //remove unneeded fields
    aggArgs.push({
      "$match": {
        "$and": queryConfig.matches.concat([{ "variable": { "$in": queryConfig.filters.values } }])
      }
    });

    //slim down model
    aggArgs.push({
      "$project": { "instnm": 1, "unitid": 1, "variable": 1, "value": 1, "fiscal_year": 1 }
    });

    //group by instnm
    aggArgs.push({
      "$group": { "_id": "$instnm", "data": { $addToSet: { "fiscal_year": "$fiscal_year", "variable": "$variable", "value": "$value" } } }
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
        results: [...sortArg, { "$skip": start }, { "$limit": stop }, { "$project": { instnm: '$_id', data: 1, '_id': 0 } }],
        totalCount: [{ $count: 'count' }]
      }
    });

    return SchoolDataSchema.aggregate(aggArgs).exec()
      .then((res: intSchoolDataQueryResult[]) => {
        let result = res.pop();
        let ret = { query: queryConfig, data: result.results };
        ret.query.pagination.total = result.totalCount.pop().count;
        if (queryConfig.inflationAdjusted == "true") {
          return getInflationAdjuster().then(adjust => {
            ret.data.forEach(datum => datum.data.forEach(item => item.value = adjust(item.fiscal_year, item.value)))
            return ret
          });
        } else return ret;
      });
  }

}