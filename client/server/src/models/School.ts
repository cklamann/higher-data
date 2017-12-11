import { model, Schema, Document, Model } from 'mongoose';
//import mongoose = require('mongoose'); //note that import brings in types and functions
//or import * as mongoose from 'mongoose' will bring in everything (will need to use alias
// to access anything, i.e, let schema =  mongoose.Schema) which is fine and you see all over
//place and might be better
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
};

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
});

export let SchoolSchema = model<intSchoolModel>('school', schema);

//note that docs say to avoid arrow functions when declaring statics, but i was
//losing this binding anyway so why not
SchoolSchema.schema.static('search', (name: string, cb: any) => {
  return SchoolSchema.find({ instnm: { $regex: `${name}+.`, $options: 'is'} }, cb).limit(25);
});

