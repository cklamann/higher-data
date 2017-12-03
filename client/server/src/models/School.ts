import * as mong from 'mongoose';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

export interface intSchoolModel extends mong.Document {
  unitid: Number;
  instnm: String;
  state: String;
  city: String;
  ein: Number;
  sector: String;
  locale: String;
  hbcu: String;
  slug: String;
};

let schema = new Schema({
  id: Schema.ObjectId,
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

export let SchoolSchema:intSchoolModel = mongoose.model('school', schema);