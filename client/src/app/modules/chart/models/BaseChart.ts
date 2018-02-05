import { intChartModel, intChartVariableModel } from '../../../../../server/src/schemas/ChartSchema';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { ChartData } from './ChartData';
import * as d3 from 'd3';
import * as _ from 'lodash';


//todo: make injectable factory to deliver objects

export interface intChartDisplayOptions {
	title: string;
	valueType: string;
	margins : {
		top: number,
		bottom: number,
		left: number,
		right: number
	}
}

export class BaseChart {
	selector: string;
	container: d3.Selection<any, any, any, any>;
	canvas: d3.Selection<any, any, any, any>;
	zScale: any;
	chartData: ChartData;
	displayOptions: intChartDisplayOptions;
	xScale: any;
	yScale: any;
	constructor(data: intChartExport, displayOptions: any) {
		this.chartData = new ChartData(data.data);
		this.zScale = d3.scaleOrdinal(d3.schemeCategory20).domain(this.chartData.data.map(variable => variable.legendName));
		this.displayOptions = displayOptions;
		this.selector = _buildUniqueSelector();
		this.container = d3.select("." + this.selector);
		this._buildCanvas();
	}

	parseDate(dateString: string): Date {
		return d3.timeParse("%Y")(dateString);
	}

	addTitle() {
		this.canvas.append("text")
			.attr("x", 0)
			.attr("y", 0 - (this.displayOptions.margins.top / 2))
			.attr("class", "title")
			.attr("text-anchor", "left")
			.style("font-size", this.displayOptions.margins.top / 1.5 + "px")
			.text(this.displayOptions.title);
	}

	private _buildCanvas() {
		const winWidth = window.innerWidth,
			w = winWidth > 992 ? 700 : winWidth > 768 ? 550 : winWidth > 576 ? 500 : 375, //todo: update w/ flexbox breakpoints
			width = w - this.displayOptions.margins.left - this.displayOptions.margins.right,
			height = (width / 1.6) - this.displayOptions.margins.top - this.displayOptions.margins.bottom;
		this.canvas = d3.select(this.selector).append("svg")
			.attr("width", width + this.displayOptions.margins.left + this.displayOptions.margins.right)
			.attr("height", height + this.displayOptions.margins.top + this.displayOptions.margins.bottom)
			.append("g")
			.attr("transform", "translate(" + this.displayOptions.margins.left + "," + this.displayOptions.margins.top + ")");
		this.xScale = d3.scaleTime().range([0, width]);
		this.yScale = d3.scaleLinear().range([height, 0]);
	}

	remove() {
		this.container.select("svg").remove();
	}

	formatNumber(num, numberFormat) {
		let suffix = (num > 999999 && num < 999999999) ? " Mil" : num > 999999999 ? " Bil" : "",
			figure = suffix === " Mil" ? num / 1000000 : suffix === " Bill" ? num / 1000000000 : num,
			res;
		switch (numberFormat) {
			case "percentage":
				res = d3.format('.1%')(figure);
				break;
			case "currency":
				let decimals = suffix === "" ? 0 : 1;
				res = d3.format("-$,." + decimals + "f")(figure);
				break;
			case "integer":
				res = d3.format("-,.0f")(figure);
				break;
			case "decimal1":
				res = d3.format("-,.1f")(figure);
				break;
			case "decimal2":
				res = d3.format("-,.2f")(figure);
				break;
			default:
				res = figure;
				console.log("Bad numberFormat passed to chart!");
				console.trace();
		}
		return res + suffix;
	}

	getYears() {
		const years = _.flatMap(this.chartData.data, x => _.flatMap(x.data, datum => datum.fiscal_year));
		return _.uniq(years);
	}

	formatAY(dateString) {
		let year = dateString.getFullYear();
		let fallYear = year - 1;
		return fallYear + "-" + String(year).substring(2);
	};

}

function _buildUniqueSelector(): string {
	return "placeholder";
}

