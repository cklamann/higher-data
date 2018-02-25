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

		this.canvas.select('.axis--x').transition().duration(500).call(this.xAxis);
		this.canvas.select('.axis--y').transition().duration(500).call(this.yAxis);
		this.canvas.select('.x-grid').transition().duration(500).call(this.xGrid);
		this.canvas.select('.y-grid').transition().duration(500).call(this.yGrid);

		const line: any = d3.line()
			.x((d: any) => this.xScale(d.fiscal_year))
			.y((d: any) => this.yScale(d.value));

		const lines = this.canvas.selectAll(".line")
			.data(this.chartData.data)
			.enter().append("g")
			.attr("class", "line");

		lines.append("path")
			.attr("d", d => {
				return line(d.data);
			})
			.style("stroke-width", 2)
			.style("stroke", d => this.zScale(d.key))
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
				.style("stroke", that.zScale(line.key))
				.style("fill", that.zScale(line.key))
				.on("mouseover", d => {
					tool.transition()
						.duration(200)
						.style("opacity", 1);
					tool.html(that.getToolTip(d.fiscal_year))
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 10) + "px");
				})
				.on("mouseout", function(d) {
					tool.transition()
						.duration(200)
						.style("opacity", 0);
				});
		});

		d3.selectAll("text")
			.attr("font-size", "12");

		let rotationDegrees = +this.width < 501 ? 45 : 30;

		d3.selectAll("g.axis--x text")
			.attr("transform", "rotate(" + rotationDegrees + ")")
			.style("text-anchor", "start");

		const legend = d3.select(".legend-container ul").selectAll("li")
			.data(this.chartData.data.filter(datum => datum.data.length > 0)); //exclude empty

		legend.exit().remove();

		legend.enter()
			.append("li")
			.attr("class", "legend-element")
			.merge(legend)
			.html((d, i) => "<span style='color:" + this.zScale(d.key) + "'>&#9679;</span>" + d.legendName);

		d3.selectAll(".legend-element")
			.on("click", (d: any) => {
				this.chartData.data.forEach((datum, i) => {
					if (datum.legendName === d.legendName) {
						this.chartData.data[i].data = [];
					}
				});
				this.canvas.selectAll("*").remove();
				this.draw();
			});
	}

	getToolTip(fiscal_year) {
		let items = _.flatMap(this.chartData.data, datum => {
			let item = datum.data.find(item => item.fiscal_year === fiscal_year),
				color = this.zScale(item.key);
			return `<li><span style='color: ${color}'>&#9679;</span> ${item.legendName} : ${item.value}</li>`;
		}),
			list = items.join('');
		return "<ul>" + list + "<ul>";
	}

};