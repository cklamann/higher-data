import { model, Schema, Document, Model } from 'mongoose';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';
import { SchoolDataAggQuery, intSchoolDataAggQuery, SchoolDataQuery, intSchoolDataQuery } from '../modules/SchoolDataQuery.module';
import * as _ from 'lodash';

export interface intSchoolBaseDataModel {
  fiscal_year: string,
  variable: string,
  value: number
}

export interface intSchoolDataModel extends intSchoolBaseDataModel {
  state: string,
  sector: string,
  name: string,
  unitid: string
};

export interface intVarExport {
  query: intSchoolDataAggQuery;
  data: intSchoolDataQueryDataResult[];
}

interface intSchoolDataQueryResult {
  totalCount: {
    count: number,
  }[],
  results: intSchoolDataQueryDataResult[]
}

interface intSchoolDataQueryDataResult {
  sector?: string,
  state?: string,
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
  name: {
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

  fetchAggregate: (queryConfig: intSchoolDataAggQuery): Promise<intVarExport> => {

    const qConfig = new SchoolDataAggQuery(queryConfig),
      sf = _.toNumber(qConfig.getSortField()) ? qConfig.getSortField() : "_id";

    // then qC.verify(), aggArgs.push(qC.getMatches()), aggArgs.push(qC.getSort()), etc. 

    let aggArgs: object[] = [];

    //filter out unneeded fields

    aggArgs.push(qConfig.getMatchArgs());

    //2 $groups -> first, reduce and groupby, then group results into 'data' array
    aggArgs.push({
      "$group": {
        "_id": {
          [qConfig.getGroupByField()]: "$" + qConfig.getGroupByField(), 'variable': '$variable', 'fiscal_year': '$fiscal_year'
        },
        "value": { ['$' + qConfig.getGroupByFunc()]: '$value' }
      }
    });

    //strip out id
    aggArgs.push({
      $project: {
        [qConfig.getGroupByField()]: "$_id." + qConfig.getGroupByField(),
        'variable': '$_id.variable',
        'fiscal_year': '$_id.fiscal_year',
        'value': '$value',
        '_id': 0
      }
    });

    aggArgs.push({
      "$group": {
        "_id": "$" + qConfig.getGroupByField(),
        "data": { ["$addToSet"]: { "fiscal_year": "$fiscal_year", "variable": "$variable", "value": "$value" } }
      }
    });

    //todo: strip out _id again in favor of groupby key to make sort cleaner

    //sort

    let normalSort = [{ "$sort": { [sf]: qConfig.getSortDirection() } }];

    //todo: abstract yearSort into queryConfig object
    //can do a check in there sortFieldIsYear(), verify that it's a valid date


    //here we build an index to rank the values of each entry in the data arrays
    let yearSort = [
      {
        $addFields: {
          'idx': {
            '$filter': {
              input: "$data",
              as: "val",
              cond: {
                $and: [
                  { "$eq": ["$$val.fiscal_year", sf] }
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
        $sort: { 'red': qConfig.getSortDirection() }
      }
    ]

    let sortArg = _.toNumber(sf) ? yearSort : normalSort;

    aggArgs.push({
      $facet: {
        results: [
          ...sortArg,
          { "$skip": qConfig.getPageOffset() },
          { "$limit": qConfig.getPageLimit() },
          { "$project": { [queryConfig.groupBy.variable]: '$_id', data: 1, '_id': 0 } }
        ],
        totalCount: [{ $count: 'count' }]
      }
    });

    return SchoolDataSchema.aggregate(aggArgs).exec()
      .then((res: intSchoolDataQueryResult[]) => {
        let result = res.pop();
        let ret = { query: queryConfig, data: result.results };
        ret.query.pagination.total = result.totalCount.length > 0 ? result.totalCount.pop().count : 0;
        if (queryConfig.inflationAdjusted) {
          return getInflationAdjuster().then(adjust => {
            ret.data.forEach(datum => datum.data.forEach(item => item.value = adjust(item.fiscal_year, item.value)))
            return ret
          });
        } else return ret;
      });
  },

  fetch(dq:SchoolDataQuery): Promise<intSchoolDataSchema[]> {
    return SchoolDataSchema
            .find(dq.getMatchArgs())
            .sort(dq.getSortArgs())
            .skip(dq.getSkipArgs())
            .limit(dq.getLimitArgs())
            .exec();
  }
}