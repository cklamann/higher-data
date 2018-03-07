import { model, Schema, Document, Model } from 'mongoose';
import { getInflationAdjuster } from '../modules/InflationAdjuster.service';
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
  matches?: {
    [key: string]: string;
  }
  groupBy?: intGroupByArgs;
  sort?: string;
  pagination: intPaginationArgs;
  inflationAdjusted: string;
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

export interface intVarAggExport {
  query: intVariableQueryConfig;
  data: intVarAggItem[];
}

export interface intVarAggItem {
  fiscal_year: string;
  variable: string;
  value: number;
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

//todo: move these in to statics object, remove callbacks:

SchoolSchema.schema.static('search', (name: string, cb: any) => {
  return SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is' } }, cb).limit(25).select('-data');
});


SchoolSchema.schema.static('getVariableList', (cb: any) => {
  return SchoolSchema.distinct("data.variable", cb);
});


SchoolSchema.schema.statics = {

  //todo: abstract this logic into query builder as it becomes necessary
  fetchAggregate: (variables: string[], queryConfig: intVariableQueryConfig): Q.Promise<intVarAggExport> => {

    const start = queryConfig.pagination.total ? queryConfig.pagination.page * queryConfig.pagination.perPage : 0,
      stop = start ? start + (queryConfig.pagination.perPage * queryConfig.pagination.page) : queryConfig.pagination.perPage;

    //todo: use chaining syntax for this
    let aggArgs: any[] = [];
    queryConfig.matches = queryConfig.matches ? queryConfig.matches : {};
    let matches = Object.entries(queryConfig.matches).map((pair: any) => {
      return { [pair[0]]: pair[1] }
    });

    if (!_.isEmpty(matches)) {
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
                { "$in": ["$$var.variable", variables] }
            }
        }
      }
    });

    aggArgs.push({ "$unwind": { "path": "$data" } })
    aggArgs.push({ "$group": { "_id": { [queryConfig.groupBy.variable]: "$" + queryConfig.groupBy.variable, "fiscal_year": "$data.fiscal_year", "variable": "$data.variable" }, value: { ["$" + queryConfig.groupBy.aggFunc]: "$data.value" } } });
    let mainQuery = SchoolSchema.aggregate(aggArgs)
    let countQuery = _.cloneDeep(mainQuery).append([{ "$count": "total" }]);

    mainQuery
      .skip(start)
      .limit(stop)
      .sort(queryConfig.sort); //todo: this should point to _id.some-field, not some-field, right?

    return Q.all([mainQuery.exec(), countQuery.exec()])
      .then((res: any) => {
        let tmp: any = {};
        tmp.data = res[0];
        tmp.query = queryConfig;
        tmp.query.pagination.total = res[1][0].total;
        return tmp;
      }).then(res => {
        res.data = res.data.map((item: any) => {
          return Object.assign({}, { value: item.value }, item._id); // unnest by _id field
        });
        return res;
      }).then(res => {
        if (queryConfig.inflationAdjusted == "true") {
          return _adjustForInflation(res);
        } else return res;
      })

    function _adjustForInflation(resp: intVarAggExport) {
      return getInflationAdjuster().then(adjuster => {
        resp.data.forEach(datum => datum.value = adjuster(datum.fiscal_year, datum.value));
        return resp;
      });
    }
  },

  fetchSchoolWithVariables: (unitid: number, variables: string[]): intSchoolModel => {
    return SchoolSchema.aggregate([
      {
        "$match": {
          "unitid": unitid
        }
      },
      {
        "$project": {
          unitid: 1,
          sector: 1,
          instnm: 1,
          city: 1,
          state: 1,
          data: {
            "$filter": {
              input: "$data",
              as: "data",
              cond: { "$in": ["$$data.variable", variables] }
            }
          }
        }
      }
    ]).exec().then((res: intSchoolModel[]) => {
      return res[0];
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