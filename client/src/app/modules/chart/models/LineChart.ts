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

		this._addKeysToChartData(); //not doing its job

		let rotationDegrees = +this.width < 501 ? 45 : 30;
		d3.selectAll("g.axis--x text")
			.attr("transform", "rotate(" + rotationDegrees + ")")
			.style("text-anchor", "start");

		this.canvas.select('.axis--x').transition().duration(500).call(this.xAxis);
		this.canvas.select('.axis--y').transition().duration(500).call(this.yAxis);
		this.canvas.select('.x-grid').transition().duration(500).call(this.xGrid);
		this.canvas.select('.y-grid').transition().duration(500).call(this.yGrid);

		const line: any = d3.line()
			.x((d: any) => this.xScale(d.fiscal_year))
			.y((d: any) => this.yScale(d.value));


		const lines = this.canvas.selectAll(".line");
		const linesWithData = lines.data(this.chartData.data, (d: intBaseChartData) => d.d3Key);
		const removedLines = linesWithData.exit().remove();
		const enteredLines = linesWithData.enter()
			.append("g")
			.attr("class", "line");

		const mergedLines = linesWithData.merge(enteredLines)
			.append("path")
			.attr("d", d => {
				return line(d.data);
			})
			.style("stroke-width", 2)
			.style("stroke", d => this.zScale(d.key))
			.style("opacity", 0)
			.transition(<any>250)
			.style("opacity", 1);

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		let that = this;

		mergedLines.each(function(theLine) {
			const circles = d3.select(this).selectAll(".circle");
			const circlesWithData = circles.data(theLine.data, (d: intBaseChartDatum) => d.fiscal_year + d.key);
			const removedCircles = circlesWithData.exit().remove();
			const enteredCircles = circlesWithData.enter().append("g")
				.attr("class", "circle");

			const mergedCircles = circlesWithData.merge(enteredCircles)
				.append("circle")
				.attr("r", 4)
				.attr("cx", d => that.xScale(d.fiscal_year))
				.attr("cy", d => that.yScale(d.value))
				.style("stroke", that.zScale(line.key))
				.style("fill", that.zScale(line.key))
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

	getToolTip(fiscal_year: Date): string {
		let items = _.flatMap(this.chartData.data, datum => {
			let item = datum.data.find(item => item.fiscal_year.getFullYear() === fiscal_year.getFullYear());
			return item ? `<li><span style='color: ${this.zScale(item.key)}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${item.legendName} : ${this.formatNumber(item.value, this.displayOptions.valueType)}</li>` : '';
		}),
			list = items.join('');
		return "<ul class='mat-caption'>" + list + "<ul>";
	}

	private _addKeysToChartData() {
		this.chartData.data.forEach(datum => {
			const total = this.chartData.sum(datum.data);
			datum.d3Key = Math.floor(this.yScale(10)) + Math.floor(this.xScale(10)) + Math.floor(total) + datum.key;
		})
	}

};