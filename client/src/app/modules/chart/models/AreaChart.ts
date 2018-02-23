import { LineChart } from './LineChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/models/ChartExporter';
import { intBaseChartDatum, intBaseChartData, ChartData } from './ChartData';
import * as d3 from 'd3';
import * as _ from 'lodash';


export class AreaChart extends LineChart {
	xAxis: any;
	yAxis: any;
	xGrid: any;
	yGrid: any;
	keys: string[];
	stackData: any;
	areaChartData: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	draw() {
		const colors = ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"];
		this.areaChartData = this._transformData(this.chartData);
		let dateRange: Array<Date> = _.uniq(_.flatMap(this.chartData.data, c => _.flatMap(c.data, d => d.fiscal_year)));
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

		const stack = d3.stack().order(d3.stackOrderDescending);
		let area = d3.area()
			.x(d => this.xScale(d.data.date))
			.y0(d => this.yScale(d[0]))
			.y1(d => this.yScale(d[1]));

		this.keys = _.keys(this.areaChartData[0]).filter(key => key != 'date');
		stack.keys(this.keys, this.chartData.getMax());
		this.stackData = stack(this.areaChartData);

		let layer = this.canvas.selectAll(".layer")
			.data(this.stackData)
			.enter().append("g")
			.attr("class", "layer");

		//doesn't like area function here
		layer.append("path")
			.attr("class", "area")
			.style("fill", (d, i) => colors[i])
			.attr("d", area);

		let legendData = _.sortBy(this.stackData, datum => datum.index).reverse(); // ensure descending order

		const legend = d3.select(".legend-container").selectAll("li")
			.data(legendData);

		legend.exit().remove();

		legend.enter()
			.append("li")
			.attr("class", "legend-element")
			.merge(legend)
			.html(d => "legend placeholder");

		// d3.selectAll(".legend-element")
		// 	.on("click", (d: any) => {
		// 		this.chartData.data.forEach((datum, i) => {
		// 			if (datum.legendName === d.legendName) {
		// 				this.chartData.data[i].data = [];
		// 			}
		// 		});
		// 		this.canvas.selectAll("*").remove();
		// 		this.draw();
		// 	});

		let barScale = d3.scaleBand().rangeRound([0, this.width]).domain(this.areaChartData.map(datum => datum.date)).padding(0.0);

		this.canvas.selectAll(".bar")
			.data(this.areaChartData)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", d => barScale(d.date))
			.style('opacity', '0.0')
			.attr("y", 0)
			.attr("width", barScale.bandwidth())
			.attr("height", this.height);

		const tool = d3.select("body").append("div")
			.attr("class", "d3-tip")
			.style("opacity", 0);

		d3.selectAll(".bar").on("mouseover", d => {
			tool.transition()
				.duration(200)
				.style("opacity", 1);
			tool.html(this.getToolTip(d))
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px");
		})
			.on("mouseout", function(d) {
				tool.transition()
					.duration(200)
					.style("opacity", 0);
			});
	}

	getToolTip(fiscal_year) {
		// let items = _.flatMap(this.chartData.data, datum => {
		// 	let item = datum.data.find(item => item.fiscal_year === fiscal_year),
		// 		color = this.zScale(item.legendName);
		// 	return `<li><span style='color: ${color}'>&#9679;</span> ${item.legendName} : ${item.value}</li>`;
		// }),
		// 	list = items.join('');
		// return "<ul>" + list + "<ul>";
		return '';
	}

	private _transformData(chartData: ChartData): any {
		let newData: any = _.flatMap(chartData.data, datum => datum.data.map( item => {
			return {
				date: item.fiscal_year
			};
		}));
		newData = _.uniqBy(newData,datum=>datum.date.getFullYear());
		chartData.data.forEach(datum => {
			datum.data.forEach(item => {
				let match = _.find(newData, piece => piece.date.getFullYear() === item.fiscal_year.getFullYear());
				match[item.key] = item.value;
			});
		});
		newData.forEach(variable => variable.date = variable.date.getFullYear()); //this is shredding to null
		newData = _.sortBy(newData, datum => datum.date);
		console.log(_.cloneDeep(newData));
		return newData;
	}

};