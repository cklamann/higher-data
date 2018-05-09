import { model, Schema, Document, Model } from 'mongoose';
import { intSchoolDataModel, intSchoolDataSchema, SchoolDataSchema } from './SchoolDataSchema';
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
  school_data?: intSchoolDataModel[];
};

export interface intSchoolSchema extends Document, intSchoolModel { };

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
}, { toJSON: { virtuals: true } });

schoolSchema.virtual('school_data', {
  ref: 'school_data',
  localField: 'unitid',
  foreignField: 'unitid',
  justOne: false
});

export let SchoolSchema = model<intSchoolSchema>('school', schoolSchema);

//todo: fix this, no more slug!
SchoolSchema.schema.statics = {
  search: (name: string): Promise<intSchoolSchema[]> => SchoolSchema.find({ instnm: { $regex: `.+${name}.+|${name}+.|.+${name}|.+${name}|${name}`, $options: 'is' } }).limit(25).exec(),
  fetch: (arg: string): Promise<intSchoolSchema> => {
    let promise;
    if (!!_.toNumber(arg)) {
      promise = SchoolSchema.findOne({ unitid: arg }).exec();
    } else promise = SchoolSchema.findOne({ slug: arg }).exec();
    return promise;
  }
};