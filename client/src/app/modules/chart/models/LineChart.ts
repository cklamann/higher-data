import { BaseChart } from './BaseChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { intBaseChartDatum, intBaseChartData } from './ChartData';
import * as d3 from 'd3';
import * as _ from 'lodash';


export class LineChart extends BaseChart {
	constructor(data: intChartExport) {
		super(data);
	}

	build() {
		
	};

	draw() {

		this.xScale.domain([
			d3.min(this.chartData.data, c => d3.min(c.data, d => d.fiscal_year)),
			d3.max(this.chartData.data, c => d3.min(c.data, d => d.fiscal_year))
		]);
		this.yScale.domain([
			this.chartData.getMin(),
			this.chartData.getMax()
		]);

		const line:any = d3.line()
			.x((d: any) => this.xScale(d.fiscal_year))
			.y((d: any) => this.yScale(d.value));

		const xAxis = d3.axisBottom(this.xScale)
			.ticks(20)
			.tickFormat(x => this.formatAY(x));

		const xGrid = d3.axisBottom(this.xScale)
			.tickSizeInner(-this.canvas.attr("height"))
			.tickFormat(x => "");

		this.canvas.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + this.canvas.attr('height') + ")")
			.call(xAxis);

		this.canvas.append("g")
			.attr("class", "grid x-grid")
			.style("opacity", 0.5)
			.attr("transform", "translate(0," + this.canvas.attr('height') + ")")
			.call(xGrid);

		const yAxis = d3.axisLeft(this.yScale)
			.tickFormat(x => this.formatNumber(x, this.displayOptions.valueType));

		const yGrid = d3.axisLeft(this.yScale)
			.tickSizeInner(-this.canvas.attr('width'))
			.tickFormat(x => "");

		this.canvas.append("g")
			.attr("class", "axis axis--y")
			.call(yAxis);

		this.canvas.append("g")
			.attr("class", "grid y-grid")
			.style("opacity", 0.5)
			.call(yGrid);

		const lines = this.canvas.selectAll(".line")
			.data(this.chartData.data)
			.enter().append("g")
			.attr("class", "line");

		lines.append("path")
			.attr("d", d => {
				return line(d.data);
			})
			.style("stroke", d => this.zScale(d.legendName))
			.style("opacity", 0)
			.transition()
			.style("opacity", 1);

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		let that = this;

		lines.each(function(line) {
			d3.select(this).selectAll("circle")
				.data(line.data)
				.enter()
				.append("circle")
				.attr("r", 4)
				.attr("cx", d => that.xScale(d.fiscal_year))
				.attr("cy", d => that.yScale(d.value))
				.style("stroke", that.zScale(line.legendName))
				.style("fill", that.zScale(line.legendName))
				// .on("mouseover", d => {
				// 	tool.transition()
				// 		.duration(200)
				// 		.style("opacity", 1);
				// 	tool.html(that.getToolTip(d.fiscal_year))
				// 		.style("left", (d3.event.pageX) + "px")
				// 		.style("top", (d3.event.pageY) + "px");
				// }) //todo: fix this!
				.on("mouseout", function(d) {
					tool.transition()
						.duration(200)
						.style("opacity", 0);
				});
		});

		d3.selectAll("text")
			.attr("font-size", "12");

		let rotationDegrees = this.w < 501 ? 45 : 30;

		d3.selectAll("g.axis--x text")
			.attr("transform", "rotate(" + rotationDegrees + ")")
			.style("text-anchor", "start");

		const legend = d3.select(".legend-container").selectAll("li")
			.data(this.chartData.data);

		legend.exit().remove();

		// legend.enter()
		// 	.append("li")
		// 	.attr("class", "legend-element")
		// 	.merge(legend)
		// 	.html((d, i) => this.getLegendLine(d, i));

		// d3.selectAll(".legend-element")
		// 	.on("click", d => {
		// 		this.removeElement(d.fiscal_year);
		// 		this.removeChart();
		// 		this.draw();
		// 	}); //todo: fix this!
	}
};

}