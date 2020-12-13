import { model, Schema, Document } from 'mongoose';
import { SchoolDataModel } from './SchoolDataSchema';
import * as _ from 'lodash';

export let ObjectId = Schema.Types.ObjectId;

export interface SchoolModel {
  unitid: string;
  name: string;
  state: string;
  city: string;
  ein: string;
  sector: string;
  locale: string;
  hbcu: string;
  slug: string;
  school_data?: SchoolDataModel[];
};

export interface SchoolSchema extends Document, SchoolModel { };

let schoolSchema: Schema = new Schema({
  id: ObjectId,
  unitid: Number,
  name: String,
  state: String,
  city: String,
  ein: String,
  locale: String,
  slug: String,
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

export let SchoolSchema = model<SchoolSchema>('school', schoolSchema);

SchoolSchema.schema.statics = {
  search: (name: string): Promise<SchoolSchema[]> => {
    return SchoolSchema.find({name:{$regex: `.*${name}.*` , $options:'i'}}).limit(25).exec();
  },
  fetch: (arg: string): Promise<SchoolSchema> => {
    let promise;
    if (!!_.toNumber(arg)) {
      promise = SchoolSchema.findOne({ unitid: arg }).exec();
    } else promise = SchoolSchema.findOne({ slug: arg }).exec();
    return promise;
  }
};