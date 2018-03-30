import { model, Schema, Document, Model } from 'mongoose';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';
import * as _ from 'lodash';
import * as Q from 'q';

export let ObjectId = Schema.Types.ObjectId;

export interface intBaseSchoolModel {
  data: intSchoolDataModel[];
  [key: string]: any;
}

export interface intSchoolModel extends intBaseSchoolModel {
  unitid: string;
  instnm: string;
  state: string;
  city: string;
  ein: string;
  sector: string;
  locale: string;
  hbcu: string;
  slug: string;
  data: intSchoolDataModel[];
};

export interface intSchoolDataModel {
  fiscal_year: string,
  variable: string,
  value: number,
};

export interface intSchoolSchema extends Document, intSchoolModel {
  data: intSchoolDataSchema[];
};

export interface intSchoolDataSchema extends Document, intSchoolDataModel { };

export interface intVariableQueryConfig {
  matches?: any[];
  sort: string;
  pagination: intPaginationArgs;
  inflationAdjusted: string;
  variables: string[];
}

export interface intVariableAggQueryConfig {
  matches?: any[];
  groupBy: intGroupByArgs;
  sort: string;
  pagination: intPaginationArgs;
  inflationAdjusted: string;
  variables: string[];
}

export interface intPaginationArgs {
  total?: number;
  page: number;
  perPage: number;
}

export interface intGroupByArgs {
  aggFunc: string;
  aggFuncName: string;
  variable: string;
}

export interface intVarExport {
  query: intVariableQueryConfig;
  data: any;
}

export interface intSchoolVarAggExport extends intVarExport {
  query: intVariableQueryConfig;
  data: intBaseSchoolModel[];
}

export interface intSchoolVarExport extends intVarExport {
  query: intVariableQueryConfig;
  data: intSchoolSchema[];
}

interface intAggDataResult {
  _id: string,
  data: intSchoolDataModel[]
}


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
  }
}, { _id: false });

let schema: Schema = new Schema({
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
  data: [schoolDataSchema]
});

export let SchoolDataSchema = model<intSchoolDataSchema>('schoolData', schema);
export let SchoolSchema = model<intSchoolSchema>('school', schema);

SchoolSchema.schema.statics = {

  getVariableList: (): Promise<string[]> => SchoolSchema.distinct("data.variable").exec(),
  search: (name: string): Promise<intSchoolSchema[]> => SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is' } }).limit(25).select('-data').exec(),
  //todo: abstract this logic into query builder as it becomes necessary
  fetchAggregate: (queryConfig: intVariableAggQueryConfig): Q.Promise<intSchoolVarAggExport> => {

    const start = queryConfig.pagination.total ? queryConfig.pagination.page * queryConfig.pagination.perPage : 0,
      stop = start ? start + (queryConfig.pagination.perPage * queryConfig.pagination.page) : queryConfig.pagination.perPage;

    let aggArgs: any[] = [];

    // so empty matches[] are ok but not other empty args? why?
    let matches = queryConfig.matches ? queryConfig.matches : [{}];

    if (!_.isEmpty(matches[0])) {
      aggArgs.push({
        "$match": {
          "$and": matches
        }
      });
    }

    aggArgs.push({
      "$project": {
        "sector": 1, "state": 1,
        "data": {
          "$filter":
            {
              input: "$data",
              as: "var",
              cond:
                { "$in": ["$$var.variable", queryConfig.variables] }
            }
        }
      }
    });

    aggArgs.push({ "$unwind": { "path": "$data" } })
    aggArgs.push({ "$group": { "_id": { [queryConfig.groupBy.variable]: "$" + queryConfig.groupBy.variable, "fiscal_year": "$data.fiscal_year", "variable": "$data.variable" }, value: { ["$" + queryConfig.groupBy.aggFunc]: "$data.value" } } });
    aggArgs.push({
      "$group": {
        "_id": "$" + "_id." + queryConfig.groupBy.variable,
        "data":
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

    //todo: test
    return Q.all([mainQuery.exec(), countQuery.exec()])
      .then((res: any) => {
        res[0] = _sort(res[0], queryConfig.sort, queryConfig.groupBy.variable);
        function _sort(data: intAggDataResult[], sortStr: string, variable: string): intAggDataResult[] {
          let dir = sortStr.substr(0, 1) == "-" ? "desc" : "asc",
            field = dir === "desc" ? sortStr.slice(1) : sortStr,
            yearSort = _.toNumber(sortStr) ? true : false,
            sortFunc: any;
          if (!yearSort) {
            if (res[0] && _.toNumber(res[0]._id)) {
              res[0].forEach((datum: any) => +datum._id);
            }
            sortFunc = (a: intAggDataResult, b: intAggDataResult) => {
              if (dir === "desc") {
                return <any>a._id > b._id ? -1 : 1;
              } else {
                return <any>a._id < b._id ? -1 : 1;
              }
            }
          } else {
            sortFunc = (a: intAggDataResult, b: intAggDataResult) => {
              if (dir === "desc") {
                //todo: these are REALLY slow, and don't work
                  //solution:use _.sortBy or d3 functions. Hmmm. Likely one of those two is best.
                return (a.data.find((item: any) => item.fiscal_year === field) ? a.data.find((item: any) => item.fiscal_year === field).value : -1) > (b.data.find((item: any) => item.year === field) ? b.data.find((item: any) => item.fiscal_year === field).value : -1) ? -1 : 1;
              } else return (a.data.find((item: any) => item.fiscal_year === field) ? a.data.find((item: any) => item.fiscal_year === field).value : -1) < (b.data.find((item: any) => item.year === field) ? b.data.find((item: any) => item.fiscal_year === field).value : -1) ? -1 : 1;
            }
          }
          data.sort(sortFunc);
          return data;
        }
        res[0] = res[0].map((datum: any) => {
          datum[queryConfig.groupBy.variable] = datum._id
          delete datum._id;
          return datum;
        });
        res[0] = res[0].slice(start, stop);
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
          res.data = _adjustForInflation(res);
        }
        return res;
      });
  },
  fetchWithVariables: (queryConfig: intVariableQueryConfig): intSchoolVarExport => {
    const start = queryConfig.pagination.total ? queryConfig.pagination.page * queryConfig.pagination.perPage : 0,
      stop = start ? start + (queryConfig.pagination.perPage * queryConfig.pagination.page) : queryConfig.pagination.perPage,
      matches = queryConfig.matches ? queryConfig.matches : [{}],
      aggArgs = [];

    if (!_.isEmpty(matches[0])) {
      aggArgs.push({
        "$match": {
          "$and": matches
        }
      });
    }

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
        data: {
          "$filter": {
            input: "$data",
            as: "data",
            cond: { "$in": ["$$data.variable", queryConfig.variables] }
          }
        }
      }
    });

    return SchoolSchema.aggregate(aggArgs)
      .skip(start)
      .limit(stop)
      .sort(queryConfig.sort)
      .exec()
      .then((res: intSchoolModel[]) => {
        if (queryConfig.inflationAdjusted == "true") {
          res.forEach(datum => _adjustForInflation(datum.data));
        }
        return { query: queryConfig, data: res };
      })
  },
  fetch: (arg: string): Promise<intSchoolSchema> => {
    let promise;
    if (!!_.toNumber(arg)) {
      promise = SchoolSchema.findOne({ unitid: arg }).select('-data').exec();
    } else promise = SchoolSchema.findOne({ slug: arg }).select('-data').exec();
    return promise;
  }
};

function _adjustForInflation(data: intSchoolDataModel[]) {
  return getInflationAdjuster().then(adjuster => {
    data.forEach(datum => datum.value = adjuster(datum.fiscal_year, datum.value));
    return data;
  });
}