import { model, Schema, Document, Model } from 'mongoose';
import * as _ from 'lodash';

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

SchoolSchema.schema.static('search', (name: string, cb: any) => {
  return SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is' } }, cb).limit(25).select('-data');
});


SchoolSchema.schema.static('getVariableList', (cb: any) => {
  return SchoolSchema.distinct("data.variable", cb);
});


export interface intVariableQueryFilter {
  schoolSlug: string;
  groupBy?: intGroupByArgs
}

export interface intGroupByArgs {
  aggFunc: string;
  aggFuncName: string;
  variable: string;
}

export interface intAggReturn {
  aggFuncName: string;
  _id: {
    fiscal_year: string;
    variable: string;
    [key: string]: string;
  };
  value: number;
}

SchoolSchema.schema.statics = {

  fetchAggregate: (variables: string[], queryFilters: intVariableQueryFilter): intAggReturn[] => {

    let aggArgs: any[] = [];

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
    aggArgs.push({ "$group": { "_id": { [queryFilters.groupBy.variable]: "$" + queryFilters.groupBy.variable, "fiscal_year": "$data.fiscal_year", "variable": "$data.variable" }, value: { ["$" + queryFilters.groupBy.aggFunc]: "$data.value" } } });

    return SchoolSchema.aggregate(aggArgs).exec().then((res: any) => res.map((item: any) => {
      item.aggFuncName = queryFilters.groupBy.aggFuncName;
      return item;
    }));
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