import { BaseChart } from './BaseChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/modules/ChartExporter.module';
import * as d3 from 'd3';
import * as _ from 'lodash';

export class BubbleStackChart extends BaseChart {
	rScale: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	build() {
		//1 px so axis line is visible

		const radiusMax = (this.width / this.chartData.data[0].data.length) / 2;

		this.xScale = d3.scaleTime().range([radiusMax, this.width]);
		this.yScale = d3.scaleLinear().range([this.height, radiusMax]);
		this.rScale = d3.scaleLinear().range([0, radiusMax]);

		this.xAxis = d3.axisBottom(this.xScale)
			.tickFormat(x => this.formatAY(x));

		this.canvas.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + this.height + ")")

		this.xGrid = d3.axisBottom(this.xScale)
			.tickSizeInner(-this.height)
			.tickFormat(x => "");

		this.yAxis = d3.axisLeft(this.yScale)
			.tickFormat(x => this.formatNumber(x, this.displayOptions.valueType).replace(/\.00/, ""));

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

		this.rScale.domain([
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

		this.chartData.data.forEach(item => item.data.forEach((datum: any) => datum.rValue = this.rScale(datum.value)))

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		const circles = this.canvas.selectAll(".layer");
		const circlesWithData = circles.data(this.chartData.data, (d: any) => d.key);
		const removedCircles = circlesWithData.exit().remove();
		const enteredCircles = circlesWithData.enter().append("g")
			.attr("class", "layer");

		circlesWithData.merge(enteredCircles)
			.each(function(item) {
				let circles = d3.select(this).selectAll(".bubble").data(item.data, (d: any) => d.rValue);
				let exited = circles.exit().remove();
				let circlesEntered = circles.enter().append("circle").attr("class", "bubble");
				circles.merge(circlesEntered)
					.attr("r", (d: any) => d.rValue)
					.attr("cx", d => that.xScale(d.fiscal_year))
					.attr("cy", d => that.yScale(d.value))
					.style("stroke", d => that.zScale(d.key))
					.style("fill", d => that.zScale(d.key))
					.style("opacity", .75)
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

		const legendData = this.chartData.data.sort((a, b) => {
			return d3.max(a.data, datum => datum.value) > d3.max(b.data, datum => datum.value) ? -1 : 1;
		}).map(data => data.data[0]);

		const legend = d3.select(".legend").selectAll("li")
			.data(legendData);

		legend.exit().remove();

		legend.enter()
			.append("li")
			.merge(legend)
			.html((d: any, i) => "<span style='color:" +
				this.zScale(d.key) +
				"'><i class='fa fa-circle'></i></span> " +
				d.legendName +
				"&nbsp</i>" +
				": " +
				d.name
			);

		d3.selectAll("text")
			.attr("font-size", "12");

	}

	getToolTip(fiscal_year: Date): string {
		let everything = _.flatMap(this.chartData.data, datum => datum.data),
			forYear = everything.filter(item => item.fiscal_year.getFullYear() === fiscal_year.getFullYear()),
			ordered = forYear.sort((a, b) => a.value > b.value ? -1 : 1),
			str = forYear.map((item: any) => `<li><span style='color: ${this.zScale(item.key)}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${item.name} : ${this.formatNumber(item.value, this.displayOptions.valueType)}</li>`).join('');
		return "<ul class='mat-caption'>" + str + "<ul>";
	}

};