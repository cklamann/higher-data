import { model, Schema, Document, Model } from 'mongoose';
import { intChartFormulaResult } from '../modules/ChartFormula.module';

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

InflationTableSchema.schema.statics = {
	//https://data.oecd.org/price/inflation-cpi.htm
	calculate: (data: intChartFormulaResult[]): Promise<intChartFormulaResult[]> => {
		return InflationTableSchema.find().sort({'year':-1})
			.then(table => {
				let latest = table[0];
				data.forEach(datum => {
					let multiplier = table.filter(item => item.year === datum.fiscal_year)[0];
					datum.value = (+latest.value / +multiplier.value) * datum.value;
				})
				return data;
			});
	}
	 
}
