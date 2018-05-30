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
	stackData: d3.Series<{ [key: string]: number }, string>[];
	areaChartData: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	draw() {

		this.areaChartData = this._transformData();
		let dateRange = this.chartData.getDateRange();
		this.xScale.domain(d3.extent(dateRange));
		let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;
		this.xAxis.ticks(tickNumber);

		let maxVal = d3.max(this.areaChartData, variable => {
			let vals = d3.keys(variable).map(key => key !== 'date' ? variable[key] : 0);
			return d3.sum(vals);
		});

		this.yScale.domain([0, maxVal]); 

		this.formatAxes();

		const stack = d3.stack().order(d3.stackOrderDescending);

		let area = d3.area()
			.x((d: any) => this.xScale(d.data.date))
			.y0(d => this.yScale(d[0]))
			.y1(d => this.yScale(d[1]));

		stack.keys(this.chartData.data.map(datum => datum.key));

		this.stackData = stack(this.areaChartData);

		const layers = this.canvas.selectAll(".layer"),
			layersWithData = layers.data(this.stackData, (d: any) => d),
			removedLayers = layersWithData.exit().remove(),
			enteredLayers = layersWithData.enter()
				.append("path")
				.attr("class", "layer")

		const mergedLayers = layersWithData.merge(enteredLayers)
			.style("fill", (d, i) => this.zScale(d.key))
			.attr("d", <any>area);

		//todo: move this stuff to parent class
		let legendData = _.sortBy(this.stackData, datum => datum.index).reverse(); // ensure descending order

		const legend = d3.select(".legend").selectAll("li")
			.data(legendData);

		legend.exit().remove();

		legend.enter()
			.append("li")
			.attr("class", "legend-element")
			.merge(legend)
			.html(d => this._getLegendLine(d))
			.on("mouseover", (d) => d3.select('.' + d.key).style("display","inline"))
			.on("mouseout", (d) => d3.select('.' + d.key).style("display","none"))
			.on("click", (d: any) => {
				this.chartData.data.forEach((datum, i) => {
					if (datum.key === d.key) {
						this.chartData.removeDatum(i);
					}
				});
				this.draw();
			})

		let barScale = d3.scaleBand().rangeRound([0, this.width]).domain(this.areaChartData.map(datum => datum.date)).padding(0.0);

		this.canvas.selectAll(".bar") //redraw every time
			.remove();

		this.canvas.selectAll(".bar")
			.data(this.areaChartData)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", (d: any) => barScale(d.date))
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
			tool.html(this._getToolTip(d))
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY) + "px");
		})
			.on("mouseout", function(d) {
				tool.transition()
					.duration(200)
					.style("opacity", 0);
			});
	}

	private _getToolTip(datum): string {
		let legendKeyMap = this.chartData.data.map(datum => {
			return { key: datum.key, legendName: datum.legendName };
		}),
			copy = _.cloneDeep(datum);
		delete copy.date;
		let tips = _.map(copy, (v, k: string) => {
			const legendName = legendKeyMap.find(item => item.key == k).legendName;
			return {
				key: k,
				legendName: legendName,
				index: this.stackData.find(datum => datum.key === k).index
			}
		});
		let sum = this.chartData.getSumForYear(datum.date);
		let sumString = `<li>Total: ${this.formatNumber(sum, this.displayOptions.valueType)}</li>`;
		tips.sort((a, b) => b.index < a.index ? -1 : b.index > a.index ? 1 : b.index >= a.index ? 0 : NaN);
		let str = tips.map(tip => {
			return "<li><span style='color:" + this.zScale(tip.key) + "'><i class='fa fa-circle' aria-hidden='true'></i></span>&nbsp" + tip.legendName + ": " + this.formatNumber(datum[tip.key], this.displayOptions.valueType) + "</li>";
		}).join("");
		return "<div>" + datum.date.getFullYear() + ":<br><ul class='mat-caption'>" + str + sumString + "</ul>";
	}

	private _getLegendLine(stackDatum) {
		let legendName = this.chartData.data.find(datum => datum.key == stackDatum.key).legendName;
		return "<span style='color:" + 
				this.zScale(stackDatum.key) + 
				"'><i class='fa fa-circle' aria-hidden='true'></i></span>&nbsp" + 
				legendName + 
				"&nbsp;<i class='fa fa-close" + " " + stackDatum.key + "' style='display:none'></i>";
	}

	private _transformData(): any {
		this.chartData.setMissingValsToZero();
		let newData: { date: Date }[] = this.chartData.getDateRange().map(date => {
			return { date: date }
		});
		this.chartData.data.forEach(datum => {
			datum.data.forEach(item => {
				let match = _.find(newData, piece => piece.date.getFullYear() === item.fiscal_year.getFullYear());
				match[item.key] = item.value;
			});
		});
		newData = _.sortBy(newData, datum => datum.date);
		return newData;
	}

};