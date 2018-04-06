import { model, Schema, Document, Model } from 'mongoose';

export interface intMajorModel {
	fiscal_year: string,
	unitid: string,
	cipcode: string,
	total_degrees: number,
	awlevel: string
};

export interface intMajorSchema extends intMajorModel, Document { };

let schema: Schema = new Schema({
	fiscal_year: String,
	unitid: String,
	cipcode: String,
	total_degrees: Number,
	awlevel: String
});

export let MajorSchema = model<intMajorSchema>('major', schema, 'majors');

MajorSchema.schema.statics = {


}
