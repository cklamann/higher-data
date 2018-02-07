import { model, Schema, Document, Model } from 'mongoose';
import * as _ from 'lodash';

export let ObjectId = Schema.Types.ObjectId;

export interface intSchoolModel {
  unitid: number;
  instnm: string;
  state: string;
  city: string;
  ein: number;
  sector: string;
  locale: string;
  hbcu: string;
  slug: string;
  data: intSchoolDataModel[];
};

export interface intSchoolDataModel {
  fiscal_year: number,
  variable: string,
  value: string,
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
    type: String,
    required: true,
    trim: true
  }
},{ _id : false });

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

SchoolSchema.schema.static('fetchVariable', (variable: string, filters: Array<any> = [], limit: number): intSchoolSchema => {
  if (typeof filters === 'number') {
    limit = filters;
    filters = [];
  }
  let fils = [{ "data.variable": variable }];
  if (_.isArray(filters) && !_.isEmpty(filters)) {
    filters.forEach(filt => {
      let res: any = {};
      res[filt.name] = {
        "$eq": filt.value
      };
      fils.push(res);
    });
  }
  return SchoolSchema.aggregate([
    {
      "$match": {
        "$and": fils
      }
    },
    {
      "$project": {
        unitid: 1,
        data: {
          "$filter": {
            input: "$data",
            as: "data",
            cond: { "$eq": ["$$data.variable", variable] }
          }
        }
      }
    }
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