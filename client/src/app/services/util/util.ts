import { Injectable } from '@angular/core';
import * as d3 from 'd3';


interface intNumberFormatter {
	format: any,
	getFormats: any
}

@Injectable()
export class UtilService {

	constructor() { }

	numberFormatter(): intNumberFormatter {
		return {
			format: format,
			getFormats: getFormats
		}

		function format(num: number, format: string): string {
			const suffix = (num > 999999 && num < 999999999) ? " Mil" : num > 999999999 ? " Bil" : "",
				figure = suffix === " Mil" ? num / 1000000 : <any>suffix === " Bill" ? num / 1000000000 : num,
				formatter = getFormats().find(item => item.name === format);
			return formatter.formula(figure) + suffix;
		}

		function getFormats(): any[] {
			return [
				{
					name: "percentage",
					formula: d3.format('.1%')
				},
				{
					name: "currency0",
					formula: d3.format("-$,.0f")
				},
				{
					name: "currency2",
					formula: d3.format("-$,.2f")
				},
				{
					name: "integer",
					formula: d3.format("-,.0f")
				},
				{
					name: "decimal1",
					formula: d3.format("-,.1f")
				},
				{
					name: "decimal2",
					formula: d3.format("-,.2f")
				}
			];
		}

	};
}