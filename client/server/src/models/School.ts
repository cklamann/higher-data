import { model, Schema, Document, Model } from 'mongoose';

export let ObjectId = Schema.Types.ObjectId;

export interface intSchoolModel extends Document {
  unitid: number;
  instnm: string;
  state: string;
  city: string;
  ein: number;
  sector: string;
  locale: string;
  hbcu: string;
  slug: string;
  data: any;
};

//todo: fill out data

let schema: Schema = new Schema({
  id: ObjectId,
  unitid: Number,
  instnm: String,
  state: String,
  city: String,
  ein: Number,
  sector: String,
  locale: String,
  hbcu: String,
  slug: String,
  data: Array
});

//todo: trim all values that come out of data

export let SchoolSchema = model<intSchoolModel>('school', schema);

//note that docs say to avoid arrow functions when declaring statics, but i was
//losing this binding anyway so why not
SchoolSchema.schema.static('search', (name: string, cb: any) => {
  return SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is'} }, cb).limit(25).select('-data');
});

//todo: add more methods for: 
//1. return many schools with 1 variable with optional filters on school type [throttle at 200, give offset]
//2. return 1 school with many variables with optional filters on school type
