import { BaseChart } from './BaseChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { intBaseChartDatum, intBaseChartData } from './ChartData';
import * as d3 from 'd3';
import * as _ from 'lodash';

export class LineChart extends BaseChart {
	xAxis: any;
	yAxis: any;
	xGrid: any;
	yGrid: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	build() {
		this.xScale = d3.scaleTime().range([0, this.width]);
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

		let lineChartData = this._addKeysToChartData(); //don't need this... todo: can

		//todo: get order of items correct in legend and tooltip by sorting

		let rotationDegrees = +this.width < 501 ? 45 : 30;
		d3.selectAll("g.axis--x text")
			.attr("transform", "rotate(" + rotationDegrees + ")")
			.style("text-anchor", "start");

		this.canvas.select('.axis--x').transition().duration(500).call(this.xAxis);
		this.canvas.select('.axis--y').transition().duration(500).call(this.yAxis);
		this.canvas.select('.x-grid').transition().duration(500).call(this.xGrid);
		this.canvas.select('.y-grid').transition().duration(500).call(this.yGrid);

		const line: d3.Line<any> = d3.line()
			.x((d: any) => this.xScale(d.fiscal_year))
			.y((d: any) => this.yScale(d.value));

		let paths = this.canvas.selectAll(".path").data(lineChartData.data, d => d.key);
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
		const circlesWithData = circles.data(lineChartData.data, d => d.key);
		const removedCircles = circlesWithData.exit().remove();
		const enteredCircles = circlesWithData.enter().append("g")
			.attr("class", "circle");

		circlesWithData.merge(enteredCircles)
			.each(function(item) {
				let circles = d3.select(this).selectAll(".circle").data(item.data, d => d.key);
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
			.data(lineChartData.data);

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

	getToolTip(fiscal_year: Date): string {
		let items = _.flatMap(this.chartData.data, datum => {
			let item = datum.data.find(item => item.fiscal_year.getFullYear() === fiscal_year.getFullYear());
			return item ? `<li><span style='color: ${this.zScale(item.key)}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${item.legendName} : ${this.formatNumber(item.value, this.displayOptions.valueType)}</li>` : '';
		}),
			list = items.join('');
		return "<ul class='mat-caption'>" + list + "<ul>";
	}

	private _addKeysToChartData() {
		let newData = _.cloneDeep(this.chartData);
		newData.data.forEach(datum => {
			const total = newData.sum(datum.data);
			datum.d3Key = datum.key + Math.floor(this.yScale(100) + this.xScale(1994)); //bleh don't work
		})
		return newData;
	}

};