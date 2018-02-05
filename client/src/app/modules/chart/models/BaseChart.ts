import { Injectable } from '@angular/core';
import { intChartModel, intChartVariableModel } from '../../../../../server/src/schemas/ChartSchema';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import * as d3 from 'd3';
import * as _ from 'lodash';

//todo: make displayOptions interface
//todo: make injectable factory to deliver objects
//todo: remove bootstrap stuff

//for child classes, follow DA pattern -> separate build and draw methods

//because of tooltips, will likely need to (at least) loop through each this.data.data and assign this.data[i].legendName to all children

export class BaseChart {
	selector: string;
	container: d3.Selection;
	canvas: d3.Selection;
	zScale: any;
	data: intChartExportDataParentModel[];
	displayOptions: any;
	xScale: any;
	yScale: any;
	constructor(data: intChartExport, displayOptions: any) {
		this.data = data.data;
		this.zScale = d3.scaleOrdinal(d3.schemeCategory20).domain(this.data.map(variable => variable.legendName));
		this.displayOptions = displayOptions;
		this.selector = _buildUniqueSelector();
		this.container = d3.select("." + this.selector);
		this.canvas = this._buildCanvas();
	}

	parseDate() { d3.timeParse("%Y"); }

	addTitle() {
		this.canvas.append("text")
			.attr("x", 0)
			.attr("y", 0 - (this.displayOptions.marginTop / 2))
			.attr("class", "title")
			.attr("text-anchor", "left")
			.style("font-size", this.displayOptions.marginTop / 1.5 + "px")
			.text(this.displayOptions.title);
	}

	private _buildCanvas() {
		const winWidth = window.innerWidth,
			w = winWidth > 992 ? 700 : winWidth > 768 ? 550 : winWidth > 576 ? 500 : 375, //todo: update w/ flexbox breakpoints
			width = w - this.displayOptions.marginLeft - this.displayOptions.marginRight,
			height = (width / 1.6) - this.displayOptions.marginTop - this.displayOptions.marginBottom;
		this.canvas = d3.select(this.selector).append("svg")
			.attr("width", width + this.displayOptions.marginLeft + this.displayOptions.marginRight)
			.attr("height", height + this.displayOptions.marginTop + this.displayOptions.marginBottom)
			.attr("class", "center-block") //todo: remove bootstrap
			.append("g")
			.attr("transform", "translate(" + this.displayOptions.marginLeft + "," + this.displayOptions.marginTop + ")");
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

	getChartMaxTotal() { //todo:fix
		let totals = this.data.map(year => year.getTotal());
		return d3.max(totals);
	}

	getYears() { //todo: test
		const years = _.flatMap(this.data, x => _.flatMap(x.data, datum => datum.fiscal_year));
		return _.uniq(years);
	}

	limitYears(count) {
		if (this.data.length > count) {
			this.data.slice(-1 * count);
		}
	}

}

function _buildUniqueSelector(): string {
	return "placeholder";
}

