import { InflationTableSchema } from '../schemas/InflationTableSchema';

export function getInflationAdjuster(): Promise<Function> {
	return InflationTableSchema.find().sort({ 'year': -1 })
		.then(table => {
			return (fiscalYear: string, value: number) => {
				const latest = table[0],
					multiplier = table.find(item => item.year == fiscalYear);
					if(!multiplier) throw new Error("inflation table is out of date, please update!");
				return (+latest.value / +multiplier.value) * value;
			}
		});
}



