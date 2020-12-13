import { BaseChart } from './BaseChart';
import { intChartExport, intChartExportDataParentModel } from '../../../../../server/src/modules/ChartExporter.module';
import * as d3 from 'd3';
import * as _ from 'lodash';

export class SteamChart extends BaseChart {
	xAxis: d3.Axis<any>;
	xGrid: any;
	yGrid: any;
	area: any;
	stack: any;
	constructor(data: intChartExport, selector: string, overrides: any) {
		super(data, selector, overrides);
	}

	build() {
		let that = this;
		this.xScale = d3.scaleTime().range([1, this.width]);
		this.yScale = d3.scaleLinear().range([this.height, 0]);

		this.yScale = d3.scaleLinear()
			.range([this.height, 0]);

		this.area = d3.area()
			//.curve(d3.curveCatmullRom)
			.curve(d3.curveStep)
			.x(function(d: any, i) { return that.xScale(d.data.date); })
			.y0(function(d) { return that.yScale(d[0]); })
			.y1(function(d) { return that.yScale(d[1]); });

		this.stack = d3.stack().order(d3.stackOrderDescending);
		this.stack.keys(this.chartData.data.map(datum => datum.key))
				  .offset(d3.stackOffsetWiggle);

		this.xAxis = d3.axisBottom(this.xScale)
			.tickFormat(x => this.formatAY(x));

		this.canvas.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + this.height + ")")

		this.xGrid = d3.axisBottom(this.xScale)
			.tickSizeInner(-this.height)
			.tickFormat(x => "");

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

		this.chartData.setMissingValsToZero();

		//copied from area...
		let _transformed = _.chain(this.chartData.data)
			.flatMap(datum => datum.data)
			.groupBy('fiscal_year')
			.map((v, k) => {
				return v.reduce((prev, curr): any => {
					return Object.assign(prev, { [curr.key]: curr.value })
				}, { date: new Date(k) })
			})
			.value();

		let stackData = this.stack(_transformed);

		let dateRange = this.chartData.getDateRange();
		this.xScale.domain(d3.extent(dateRange));

		let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;

		let max = d3.max(_transformed, variable => {
			let vals = d3.keys(variable).map(key => key !== 'date' ? variable[key] : 0);
			return d3.sum(vals);
		});

		this.yScale.domain([d3.min(stackData, stackMin), d3.max(stackData, stackMax)])

		function stackMax(layer) {
			return d3.max(layer, function(d) { return d[1]; });
		}

		function stackMin(layer) {
			return d3.min(layer, function(d) { return d[0]; });
		}

		//ensure uniform order of tooltips, etc.
		// this.chartData.data.sort((a, b) => {
		// 	let aSum = a.data.reduce((a, b) => a + b.value, 0),
		// 		bSum = a.data.reduce((a, b) => a + b.value, 0);
		// 	return aSum > bSum ? -1 : 1;
		// });

		this.xAxis.ticks(d3.timeYear.every(1));
		if (this.width < 401) {
			this.xAxis.ticks(d3.timeYear.every(2));
		}

		this.canvas.select('.axis--x').transition().duration(500).call(<any>this.xAxis);
		this.canvas.select('.x-grid').transition().duration(500).call(this.xGrid);
		this.canvas.select('.y-grid').transition().duration(500).call(this.yGrid);

		let rotationDegrees = +this.width < 501 ? 45 : 30;
		d3.selectAll("g.axis--x text")
			.attr("transform", "rotate(" + rotationDegrees + ")")
			.style("text-anchor", "start");
	

		let paths = this.canvas
			.selectAll('.steam-path')
			.data(stackData);

		paths.exit()
			.transition()
			.duration(300)
			.style('opacity', 0)
			.remove();

		// .on('mousemove', handleMousemove)
		// .on('mouseout', handleMouseout);

		paths.transition()
			.duration(300)
			.attr('d', this.area)
			.style('opacity', 1);


		let enteredPaths = paths.enter().append('path')
			.attr('class', 'steam-path')
			.attr('d', this.area)
			.style('fill', function(d, i) { return that.zScale(i); })
			.style('opacity', 0);

		const mergedPaths = paths.merge(enteredPaths)
			.style("fill", (d, i) => that.zScale(i))
			.attr("d", <any>this.area)
			.style('opacity', 1);


		// const tool = d3.select("body").append("div")
		// 	.attr("class", "d3-tip")
		// 	.style("opacity", 0);


		// d3.selectAll("text")
		// 	.attr("font-size", "12");

	}

	getToolTip(fiscal_year: Date): string {
		let everything = _.flatMap(this.chartData.data, datum => datum.data),
			forYear = everything.filter(item => item.fiscal_year.getFullYear() === fiscal_year.getFullYear()),
			sum = forYear.reduce((a, b) => a + b.value, 0),
			str = forYear.map(item => `<li><span style='color: ${this.zScale(item.key)}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${item.legendName} : ${this.formatNumber(item.value, this.displayOptions.valueType)}</li>`).join('');
		return "<ul class='mat-caption'>" + str + "<ul>";
	}

};