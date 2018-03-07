import { model, Schema, Document, Model } from 'mongoose';
import { intFormulaParserResult } from '../modules/FormulaParser.module';

export interface intInflationTableModel {
	year: string;
	value: string;
};

export interface intInflationTableSchema extends intInflationTableModel, Document { };

let schema: Schema = new Schema({
	year: {
		type: String,
		required: true,
		unique: true
	},
	value:String,
});

export let InflationTableSchema = model<intInflationTableSchema>('inflation_table', schema, 'inflation_table');
