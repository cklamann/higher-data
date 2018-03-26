interface intSectors {
	number: number,
	const: string,
	name: string
}

export let sectors: intSectors[] = [
	{
		number: 1,
		const: "PUBLIC_4",
		name: "Public 4-Year"
	},
	{
		number: 2,
		const: "PRIVATE_4",
		name: "Private 4-Year"
	},
	{
		number: 3,
		const: "FOR_PROFIT_4",
		name: "For-Profit 4-Year"
	},
	{
		number: 4,
		const: "PUBLIC_2",
		name: "Public 2-Year"
	},
	{
		number: 5,
		const: "PRIVATE_2",
		name: "Private 2-Year"
	},
	{
		number: 6,
		const: "FOR_PROFIT_2",
		name: "For-Profit 2-Year"
	},
	{
		number: 7,
		const: "PUBLIC_LT_2",
		name: "Public, Less than 2-Year"
	},
	{
		number: 8,
		const: "PRIVATE_LT_2",
		name: "Private, Less than 2-Year"
	},
	{
		number: 9,
		const: "FOR_PROFIT_LT_2",
		name: "For-Profit, Less than 2-Year"
	}
];