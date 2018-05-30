import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as _ from 'lodash';


interface intNumberFormatter {
	format: any,
	getFormats: any
}

@Injectable()
export class UtilService {

	constructor() { }

	//todo: fix this --> don't need to instantiate, just do util.numberFormatter.format()
	numberFormatter(): intNumberFormatter {
		return {
			format: format,
			getFormats: getFormats
		}

		function format(num: number, format: string): string {
			let abs = Math.abs(num);
			const suffix = (abs > 999999 && abs < 999999999) ? " Mil" : abs > 999999999 ? " Bil" : "",
				figure = suffix === " Mil" ? (num / 10000) / 100 : <any>suffix === " Bil" ? (num / 10000000) / 100 : num,
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

	/*
		assigns source props to obj only if prop names already exist on obj
	
	*/

	assignToOwnProps(obj: object, src: object): object {
		let srcC = _.cloneDeep(src);

		_filterForeign(obj, srcC);

		return Object.assign(obj, srcC);

		function _filterForeign(obj: object, src: object) {
			_.forIn(src, (v,k) => {
				if (_.isObject(v) && _.isObject(obj[k])) {
					_filterForeign(v, src[k]);
				}
				if (! (Object.keys(obj).find(key => key === k) )) delete src[k]
			});
		}
	}

}