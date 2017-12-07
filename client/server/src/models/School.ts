import * as mongoose from 'mongoose'; //note that import brings in types and functions
//also note that the below is identical to the above

//import mongoose = require('mongoose'); //note that import brings in types and functions

let Schema = mongoose.Schema;
export let ObjectId = mongoose.Schema.Types.ObjectId;


export interface intSchoolModel extends mongoose.Document {
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

let schema = new Schema({
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


export let SchoolSchema = mongoose.model<intSchoolModel>('school', schema);