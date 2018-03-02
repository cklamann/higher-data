import { BaseChart } from './BaseChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import * as d3 from 'd3';
import * as _ from 'lodash';

export class LineChart extends BaseChart {
	//todo:fix typings
	xAxis: any;
	yAxis: any;
	xGrid: any;
	yGrid: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	build() {
		//1 px so axis line is visible
		this.xScale = d3.scaleTime().range([1, this.width]);
		this.yScale = d3.scaleLinear().range([this.height, 0]);

		this.xAxis = d3.axisBottom(this.xScale)
			.tickFormat(x => this.formatAY(x));

		this.canvas.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + this.height + ")")

		this.xGrid = d3.axisBottom(this.xScale)
			.tickSizeInner(-this.height)
			.tickFormat(x => "");

		this.yAxis = d3.axisLeft(this.yScale)
			.tickFormat(x => this.formatNumber(x, this.displayOptions.valueType));

		this.canvas.append("g")
			.attr("class", "axis axis--y");

		this.yGrid = d3.axisLeft(this.yScale)
			.tickSizeInner(-this.width)
			.tickFormat(x => "");

		this.canvas.append("g")
			.attr("class", "grid y-grid")
			.style("opacity", 0.5);

		this.draw();
	};

	draw() {

		let that = this;

		let dateRange = this.chartData.getDateRange();
		this.xScale.domain(d3.extent(dateRange));
		let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;

		this.xAxis.ticks(tickNumber)

		this.yScale.domain([
			this.chartData.getMin(),
			this.chartData.getMax()
		]);

		//ensure uniform order of tooltips, etc.
		this.chartData.data.sort((a, b) => {
			let aSum = a.data.reduce((a, b) => a + b.value, 0),
				bSum = a.data.reduce((a, b) => a + b.value, 0);
			return aSum > bSum ? -1 : 1;
		});

		this.formatAxes();

		const line: d3.Line<any> = d3.line()
			.x((d: any) => this.xScale(d.fiscal_year))
			.y((d: any) => this.yScale(d.value));

		let paths = this.canvas.selectAll(".path").data(this.chartData.data, (d: any) => d.key);
		let removedPaths = paths.exit().remove();
		let enteredPaths = paths.enter().append("path").attr("class", "path");
		enteredPaths.merge(paths)
			.attr("d", d => line(d.data))
			.style("stroke-width", 2)
			.style("stroke", d => that.zScale(d.key))
			.style("opacity", 0)
			.style("opacity", 1);

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		const circles = this.canvas.selectAll(".circle");
		const circlesWithData = circles.data(this.chartData.data, (d: any) => d.key);
		const removedCircles = circlesWithData.exit().remove();
		const enteredCircles = circlesWithData.enter().append("g")
			.attr("class", "circle");

		circlesWithData.merge(enteredCircles)
			.each(function(item) {
				let circles = d3.select(this).selectAll(".circle").data(item.data, (d: any) => d.key);
				let exited = circles.exit().remove();
				let circlesEntered = circles.enter().append("circle").attr("class", "circle");
				circles.merge(circlesEntered)
					.attr("r", 4)
					.attr("cx", d => that.xScale(d.fiscal_year))
					.attr("cy", d => that.yScale(d.value))
					.style("stroke", d => that.zScale(d.key))
					.style("fill", d => that.zScale(d.key))
					.on("mouseover", d => {
						tool.transition()
							.duration(200)
							.style("opacity", 1);
						tool.html(that.getToolTip(d.fiscal_year))
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 10) + "px");
					}).on("mouseout", function(d) {
						tool.transition()
							.duration(200)
							.style("opacity", 0);
					});
			});


		d3.selectAll("text")
			.attr("font-size", "12");

		const legend = d3.select(".legend").selectAll("li")
			.data(this.chartData.data);

		legend.exit().remove();

		legend.enter()
			.append("li")
			.attr("class", "legend-element")
			.merge(legend)
			.html((d, i) => "<span style='color:" + this.zScale(d.key) + "'><i class='fa fa-circle' aria-hidden='true'></i></span> " + d.legendName);

		d3.selectAll(".legend-element")
			.on("click", (d: any) => {
				this.chartData.data.forEach((datum, i) => {
					if (datum.legendName === d.legendName) {
						this.chartData.removeDatum(i);
					}
				});
				this.draw();
			});
	}

	//todo: make this total work for tooltip
	getToolTip(fiscal_year: Date): string {
		let items = _.flatMap(this.chartData.data, datum => {
			let item = datum.data.find(item => item.fiscal_year.getFullYear() === fiscal_year.getFullYear());
			if (!_.isEmpty(item)) {
				return item;
			}
		}),
			total = items.reduce((a, b) => a + (b ? b.value : 0), 0),
			list = items.map(item => `<li><span style='color: ${this.zScale(item.key)}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${item.legendName} : ${this.formatNumber(item.value, this.displayOptions.valueType)}</li>`).join('');
		return "<ul class='mat-caption'>" + list + `<li>Total: ${this.formatNumber(total, this.displayOptions.valueType)}</li>` + "<ul>";
	}

};