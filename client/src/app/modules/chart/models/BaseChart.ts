import { intChartModel, intChartVariableModel } from '../../../../../server/src/schemas/ChartSchema';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { ChartData } from './ChartData';
import { UtilService } from '../../../services/util/util';
import * as d3 from 'd3';
import * as _ from 'lodash';

export interface intChartDisplayOptions {
	title: string;
	valueType: string;
	margins: {
		top: number,
		bottom: number,
		left: number,
		right: number
	}
	widthRatio: number
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
	width: number;
	height: number;
	formatNumber: any;

	constructor(chart: intChartExport, selector: string, overrides: object = {}) {
		this.formatNumber = new UtilService().numberFormatter().format;
		this.chartData = new ChartData(chart.data);
		this.selector = selector;
		this.zScale = d3.scaleOrdinal(d3.schemeCategory20).domain(this.chartData.data.map(variable => variable.key));
		this.displayOptions = Object.assign({
			title: chart.chart.name,
			valueType: chart.chart.valueType,
			margins: {
				top: 10,
				bottom: 50,
				left: 70,
				right: 50
			},
			widthRatio: 1
		}, overrides);
		this.buildCanvas();
		this.build();

	}

	build() {
		throw new Error("build method should be overriden by child");
	}

	draw() {
		throw new Error("draw method should be overridden by child");
	}

	buildCanvas() {
		this.container = d3.select("." + this.selector);
		const winWidth = window.innerWidth;
		//angular material: layout-gt-xs = width >= 600px; layout-gt-sm =	width >= 960px
		//.52 is width of chart canvas on full size, one smaller size, just leave 25px gutter
		let w = winWidth > 960 ? .52 * winWidth : winWidth > 600 ? winWidth - 50 : winWidth - 20;
		w = w * this.displayOptions.widthRatio;
		this.width = w - this.displayOptions.margins.left - this.displayOptions.margins.right;
		this.height = (this.width / 1.5) - this.displayOptions.margins.top - this.displayOptions.margins.bottom;
		this.canvas = this.container.append("svg")
			.attr("width", this.width + this.displayOptions.margins.left + this.displayOptions.margins.right)
			.attr("height", this.height + this.displayOptions.margins.top + this.displayOptions.margins.bottom)
			.style("display", "flex")
			.append("g")
			.attr("transform", "translate(" + this.displayOptions.margins.left + "," + this.displayOptions.margins.top + ")");
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

	remove() {
		this.container.select("svg").remove();
		d3.selectAll(".d3-tip").remove();
		d3.select(".legend").selectAll("*").remove();
	}

	redraw() {
		this.remove();
		this.buildCanvas();
		this.build();
		setTimeout(() => {
			this.draw();
		}, 50)
	}

	formatAY(dateString) {
		let year = dateString.getFullYear();
		let fallYear = year - 1;
		return fallYear + "-" + String(year).substring(2);
	};

}