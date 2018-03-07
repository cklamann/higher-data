import { InflationTableSchema } from '../schemas/InflationTableSchema';

export function getInflationAdjuster(): Promise<Function> {
	return InflationTableSchema.find().sort({ 'year': -1 })
		.then(table => {
			return (fiscalYear: string, value: number) => {
				const latest = table[0],
					multiplier = table.filter(item => item.year === fiscalYear)[0];
				return (+latest.value / +multiplier.value) * value;
			}
		});
}



