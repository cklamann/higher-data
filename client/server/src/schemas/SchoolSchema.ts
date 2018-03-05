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
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9]
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

//db.schools.aggregate([{"$project":{"sector":1,"state":1,data":{"$filter":{input:"$data",as: "var",cond:{ "$in": ["$$var.variable", ["room_and_board","in_state_tuition"]]}}}}}, {"$unwind":{"path":"$data"}},{"$group":{"_id":{"sector":"$sector","fiscal_year":"$data.fiscal_year","variable":"$data.variable"},"median":{"$avg":"$data.value"}}}])
//the above will bring back agg data
//the below aggregation query will limit it for the passed school, maybe.

//todo: need pagination info...

SchoolSchema.schema.static('fetchVariables', (variables: string[], queryFilters: { [key: string]: string }[] = [], aggArgs: { [key: string]: string }[] = []): intSchoolSchema => {
  let qf = queryFilters.schoolSlug != "aggregate" ? {
    "$match":
      { "slug": schoolSlug }
  } : {};

  let unwind = queryFilters.groupBy ? { "$unwind": { "path": "$data" } } : {};

  let groupBy = queryFilters.groupBy ? {
    "$group": { "_id": { [queryFilters.groupBy.variable]: "$" + queryFilters.groupBy.variable, "fiscal_year": "$data.fiscal_year", "variable": "$data.variable" }, [queryFilters.groupBy.aggName]: { ["$" + queryFilters.groupBy.aggFunc]: "$data.value" } }
  } : {};

  SchoolSchema.aggregate([
    qf,
    {
      "$project":
        {
          "sector": 1,
          "state": 1,
          "data":
            {
              "$filter":
                {
                  input: "$data",
                  as: "var",
                  cond:
                    { "$in": ["$$var.variable", variables] }
                }
            }
        }
    },
    unwind,
    groupBy
  ]).limit(limit ? limit : 1000000).exec();
});


SchoolSchema.schema.static('fetchSchoolWithVariables', (unitid: number, variables: string[]): intSchoolModel => {
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
    let result = res[0];
    _.forEach(result.data, (v, k) => {
      _.forEach(v, val => {
        if (_.isString(val)) {
          val = val.trim();
        }
      });
    });
    return result;
  })
});

SchoolSchema.schema.static('fetch', (arg: string): Promise<intSchoolSchema> => {
  let promise;
  if (!!_.toNumber(arg)) {
    promise = SchoolSchema.findOne({ unitid: arg }).select('-data').exec();
  } else promise = SchoolSchema.findOne({ slug: arg }).select('-data').exec();
  return promise;
});