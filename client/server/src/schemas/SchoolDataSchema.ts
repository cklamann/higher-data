import { model, Schema, Document, Model } from 'mongoose';

export interface intSchoolDataModel {
  fiscal_year: string,
  variable: string,
  value: number,
  unitid: string,
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
  },
  unitid: {
  	type: String,
  	required: true,
  	trim: true
  }
});

export let SchoolDataSchema = model<intSchoolDataSchema>('school_data', schoolDataSchema, 'school_data');

SchoolDataSchema.schema.statics = {

	getVariableList: (): Promise<string[]> => SchoolDataSchema.distinct('variable').exec()

}