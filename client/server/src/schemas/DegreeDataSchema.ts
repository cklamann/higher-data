import { model, Schema, Document, Model } from 'mongoose';

export interface intDegreeDataModel {
	fiscal_year: string,
	unitid: string,
	cipcode: string,
	total_degrees: number,
	awlevel: string,
	state: string,
	sector: string,
	isntnm: string
};

export interface intDegreeDataSchema extends intDegreeDataModel, Document { };

let schema: Schema = new Schema({
	fiscal_year: String,
	unitid: String,
	cipcode: String,
	total_degrees: Number,
	awlevel: String,
	state: String,
	sector: String,
	instnm: String
});

export let DegreeDataSchema = model<intDegreeDataSchema>('degree_data', schema, 'degree_data');

DegreeDataSchema.schema.statics = {


}
