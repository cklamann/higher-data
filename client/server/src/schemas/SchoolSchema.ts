import { model, Schema, Document, Model } from 'mongoose';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';
import { intSchoolDataModel, intSchoolDataSchema, SchoolDataSchema } from './SchoolDataSchema';
import * as _ from 'lodash';
import * as Q from 'q';

export let ObjectId = Schema.Types.ObjectId;

export interface intSchoolModel {
  unitid: string;
  instnm: string;
  state: string;
  city: string;
  ein: string;
  sector: string;
  locale: string;
  hbcu: string;
  slug: string;
  school_data?: intSchoolDataModel[];
};

export interface intSchoolDataExportModel extends intSchoolModel {
  total?: number;
}

export interface intSchoolSchema extends Document, intSchoolModel { };

export interface intVariableAggQueryConfig {
  matches?: any[];
  groupBy: intGroupByArgs;
  sort: string;
  pagination: intPaginationArgs;
  inflationAdjusted: string;
  variables: string[];
}

export interface intGroupByArgs {
  aggFunc: string;
  variable: string;
}

export interface intVarExport {
  query: intVariableQueryConfig;
  data: any[];
}

export interface intSchoolVarAggExport extends intVarExport {
  query: intVariableQueryConfig;
  data: any[];
}

export interface intSchoolVarExport extends intVarExport {
  query: intVariableQueryConfig;
  data: intSchoolSchema[];
}

interface intAggDataResult {
  _id: string,
  school_data: intSchoolDataModel[]
}

let schoolSchema: Schema = new Schema({
  id: ObjectId,
  unitid: String,
  instnm: String,
  state: String,
  city: String,
  ein: String,
  locale: String,
  sector: {
    type: String,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 40]
  },
  hbcu: String,
  slug: String,
}, { toJSON: { virtuals: true } });

schoolSchema.virtual('school_data', {
  ref: 'school_data',
  localField: 'unitid',
  foreignField: 'unitid',
  justOne: false
});

export let SchoolSchema = model<intSchoolSchema>('school', schoolSchema);

SchoolSchema.schema.statics = {

  search: (name: string): Promise<intSchoolSchema[]> => SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is' } }).limit(25).exec(),
  //todo: abstract this logic into query builder

  //todo: create query builder based on query config
  //need to be assured that this object will tell us everything we need to know to build query
  // so should find out what that is and then validate and then build agg pipeline from it
  fetchAggregate: (queryConfig: intVariableAggQueryConfig): Q.Promise<intSchoolVarAggExport> => {
    const start = (queryConfig.pagination.page * queryConfig.pagination.perPage) - queryConfig.pagination.perPage,
      stop = queryConfig.pagination.perPage * queryConfig.pagination.page;

    let aggArgs: any[] = [];

    aggArgs.push({
      "$lookup": {
        "from": "school_data",
        "localField": "unitid",
        "foreignField": "unitid",
        "as": "school_data"
      }
    });

    aggArgs.push({
      "$match": {
        "$and": queryConfig.matches.concat([{ "school_data": { "$elemMatch": { "variable": { "$in": queryConfig.variables } } } }])
      }
    });

    aggArgs.push({
      "$project": {
        "sector": 1, "state": 1,
        "school_data": {
          "$filter":
            {
              input: "$school_data",
              as: "var",
              cond:
                { "$in": ["$$var.variable", queryConfig.variables] }
            }
        }
      }
    });

    aggArgs.push({ "$unwind": { "path": "$school_data" } })
    //note:  this is different from the other, need to combine
    aggArgs.push({ "$group": { "_id": { [queryConfig.groupBy.variable]: "$" + queryConfig.groupBy.variable, "fiscal_year": "$school_data.fiscal_year", "variable": "$school_data.variable" }, value: { ["$" + queryConfig.groupBy.aggFunc]: "$school_data.value" } } });
    aggArgs.push({
      "$group": {
        "_id": "$" + "_id." + queryConfig.groupBy.variable,
        "school_data":
          {
            "$push":
              {
                "fiscal_year": "$_id.fiscal_year",
                "value": "$value",
                "variable": "$_id.variable"
              }
          }
      }
    });
    let mainQuery = SchoolSchema.aggregate(aggArgs);

    let countQuery = _.cloneDeep(mainQuery).append([{ "$count": "total" }]);

    return Q.all([mainQuery.exec(), countQuery.exec()])
      .then((res: any) => {
        res[0] = _sort(res[0], queryConfig.sort, queryConfig.groupBy.variable);
        function _sort(data: intAggDataResult[], sortStr: string, variable: string): intAggDataResult[] {
          let dir = sortStr ? sortStr.substr(0, 1) == "-" ? "desc" : "asc" : "asc",
            field = dir === "desc" ? sortStr.slice(1) : sortStr,
            yearSort = _.toNumber(sortStr) ? true : false,
            sortFunc: any;
          if (!yearSort) {
            if (res[0].length > 0 && _.toNumber(res[0]._id)) {
              res[0].forEach((datum: any) => +datum._id);
            }
            sortFunc = (a: intAggDataResult) => a._id;
          } else {
            sortFunc = (a: intAggDataResult) => a.school_data.find((item: any) => item.fiscal_year == field) ? a.school_data.find((item: any) => item.fiscal_year == field).value : -1;
          }
          data = _.sortBy(data, sortFunc);
          if (dir === "desc") data.reverse();
          return data;
        }
        res[0] = res[0].slice(start, stop); //paginate
        res[0] = res[0].map((datum: any) => {
          datum[queryConfig.groupBy.variable] = datum._id
          delete datum._id;
          return datum;
        });
        return res;
      })
      .then(res => {
        let tmp: any = {};
        tmp.data = res[0];
        tmp.query = queryConfig;
        tmp.query.pagination.total = res[1][0].total;
        return tmp;
      })
      .then(res => {
        if (queryConfig.inflationAdjusted == "true") {
          return getInflationAdjuster().then(adjuster => {
            res.data.forEach((datum: any) => datum.school_data.forEach((item: any) => item.value = adjuster(item.fiscal_year, item.value)))
            return res
          });
        } else return res;
      });
  },

  fetchWithVariables: (queryConfig: intVariableQueryConfig): intSchoolVarExport => {
    const start = (queryConfig.pagination.page * queryConfig.pagination.perPage) - queryConfig.pagination.perPage,
      stop = queryConfig.pagination.perPage,
      aggArgs = [],
      matchArg = {
        "$and": queryConfig.matches.filter(match => !_.isEmpty(match)).concat([{ "school_data": { "$elemMatch": { "variable": { "$in": queryConfig.variables } } } }])
      },
      sortDir = queryConfig.sort ? queryConfig.sort.substr(0, 1) == "-" ? -1 : 1 : 1,
      sortField = sortDir == -1 ? queryConfig.sort.slice(1) : queryConfig.sort ? queryConfig.sort : "instnm";

    aggArgs.push({
      "$lookup": {
        "from": "school_data",
        "localField": "unitid",
        "foreignField": "unitid",
        "as": "school_data"
      }
    });

    aggArgs.push({ "$match": matchArg });

//    only need these if sorting on a year
    let idx = {
      $addFields: {
        'idx': {
          '$filter': {
            input: "$data",
            as: "val",
            cond: {
              $and: [
                { $eq: ["$$val.fiscal_year", sortField] },
                { $eq: ["$$val.variable", queryConfig.variables[0]] }
              ]
            }
          }
        }
      }
    }

    let red = {
      $addFields: {
        'red': {
          '$reduce': {
            input: "$idx",
            initialValue: 0,
            in: { "$sum": ["$$value", "$$this.value"] }
          }
        }
      }
    }
    if (_.toNumber(sortField)) {
      aggArgs.push(idx);
      aggArgs.push(red);
      aggArgs.push({ "$sort": { "red": sortDir } });
    } else aggArgs.push({ "$sort": { [sortField]: sortDir } });

    aggArgs.push({ "$skip": start });
    aggArgs.push({ "$limit": stop });

    aggArgs.push({
      "$project": {
        unitid: 1,
        instnm: 1,
        city: 1,
        state: 1,
        sector: 1,
        ein: 1,
        locale: 1,
        hbcu: 1,
        school_data : {
          "$filter": {
            input: "$school_data",
            as: "school_data",
            cond: { "$in": ["$$school_data.variable", queryConfig.variables] }
          }
        }
      }
    });

    return SchoolSchema.aggregate(aggArgs).exec()
      .then((res: intSchoolDataExportModel[]) => {
        let ret = { query: queryConfig, data: res }
        if (queryConfig.inflationAdjusted == "true") {
          return getInflationAdjuster().then(adjuster => {
            ret.data.forEach(datum => datum.school_data.forEach(item => item.value = adjuster(item.fiscal_year, item.value)))
            return ret
          });
        } else return ret;
      })
      .then((ret: intVarExport) => {
        return SchoolSchema.find(queryConfig.matches).count().exec()
          .then((theCount: number) => {
            ret.query.pagination.total = theCount;
            return ret;
          });
      });
  },
  fetch: (arg: string): Promise<intSchoolSchema> => {
    let promise;
    if (!!_.toNumber(arg)) {
      promise = SchoolSchema.findOne({ unitid: arg }).exec();
    } else promise = SchoolSchema.findOne({ slug: arg }).exec();
    return promise;
  }
};