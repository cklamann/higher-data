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

		let dateRange = this.chartData.getDateRange();
		this.xScale.domain(d3.extent(dateRange));
		let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;

		this.xAxis.ticks(tickNumber)

		this.yScale.domain([
			this.chartData.getMin(),
			this.chartData.getMax()
		]);

		//d3 binds by reference, so need a fresh dataset for each draw() call
		let lineChartData = this._addKeysToChartData();

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

		const lines = this.canvas.selectAll(".line");
		const linesWithData = lines.data(lineChartData.data, (d: intBaseChartData) => d.key); //making this d3key redraws when we remove, but doesn't help inflation

		//so still not really working with inflation, etc

		//todo: scrap this each bullshit, use this:

		//https://github.com/d3/d3-selection#selection_data

		linesWithData.style('stroke','black');

		const removedLines = linesWithData.exit().remove();
		const enteredLines = linesWithData.enter()
			.append("g")
			.attr("class", "line");

		const mergedLines = linesWithData.merge(enteredLines);



		let that = this;

		mergedLines.each(function(theLine) {
			const path = d3.select(this).selectAll(".path");
			const pathWithData = path.data([theLine.data]);
			const removedPath = pathWithData.exit().remove();
			const enteredPaths = pathWithData.enter()
				.append("g")
				.attr("class", "path");

			const mergedPaths = pathWithData.merge(enteredPaths)	
				.append("path")
				.attr("d", d => line(d))
				.style("stroke-width", 2)
				.style("stroke", d => that.zScale(theLine.key))
				.style("opacity", 0)
				.style("opacity", 1);

			

		});

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		mergedLines.each(function(theLine) {
			const circles = d3.select(this).selectAll(".circle");
			const circlesWithData = circles.data(theLine.data);
			const removedCircles = circlesWithData.exit().remove();
			const enteredCircles = circlesWithData.enter().append("g")
				.attr("class", "circle")
				.append("circle")
				.attr("r", 4)
				.attr("cx", d => that.xScale(d.fiscal_year))
				.attr("cy", d => that.yScale(d.value))
				.style("stroke", that.zScale(theLine.key))
				.style("fill", that.zScale(theLine.key));

			const mergedCircles = circlesWithData.merge(enteredCircles)
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