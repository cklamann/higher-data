import { InflationTableSchema } from '../schemas/InflationTableSchema';

//usage getInflationAdjuster().then(adjuster => {
//	needsAdjusting[].forEach(item => item.value = adjuster(item.fiscal_year,item.value))
// })

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



