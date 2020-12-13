import { LineChart } from "./LineChart";
import { ChartExport } from "./../../../../../../server/src/modules/ChartExporter.module";
import * as d3 from "d3";
import * as _ from "lodash";

interface intAreaChartData {
  date: any;
  [key: string]: any;
}

export class AreaChart extends LineChart {
  xAxis: any;
  yAxis: any;
  xGrid: any;
  yGrid: any;
  keys: string[];
  stackData: d3.Series<{ [key: string]: number }, string>[];
  stack: any;
  areaChartData: intAreaChartData[];
  constructor(data: ChartExport, selector: string, overrides: any) {
    super(data, selector, overrides);
  }

  draw() {
    let dateRange = this.chartData.getDateRange();
    this.xScale.domain(d3.extent(dateRange));

    let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;
    this.xAxis.ticks(tickNumber);

    this.areaChartData = this._transformData();

    let maxPos = d3.max(this._transformData("POSITIVE"), (variable) => {
      let vals = d3
        .keys(variable)
        .map((key) => (key !== "date" ? variable[key] : 0));
      return d3.sum(vals);
    });

    let maxNeg = d3.max(this._transformData("NEGATIVE"), (variable) => {
      let vals = d3
        .keys(variable)
        .map((key) => (key !== "date" ? Math.abs(variable[key]) : 0));
      return d3.sum(vals);
    });

    //min should be at least 0
    this.yScale.domain([maxNeg > 0 ? maxNeg * -1 : 0, maxPos]);

    this.formatAxes();

    this.stack = d3.stack().order(d3.stackOrderDescending);
    this.stack.keys(this.chartData.data.map((datum) => datum.key));

    this._drawAreaChart("POSITIVE");

    this._drawAreaChart("NEGATIVE");

    this._drawLegend();

    this._drawBarsForToolTip();
  }

  private _drawAreaChart(typeFlag) {
    let area = d3
      .area()
      .x((d: any) => this.xScale(d.data.date))
      .y0((d) => this.yScale(d[0]))
      .y1((d) => this.yScale(d[1]));

    this.stackData = this.stack(this._transformData(typeFlag));

    const layers = this.canvas.selectAll(".layer-" + typeFlag),
      layersWithData = layers.data(this.stackData, (d: any) => d),
      removedLayers = layersWithData.exit().remove(),
      enteredLayers = layersWithData
        .enter()
        .append("path")
        .attr("class", "layer-" + typeFlag);

    const mergedLayers = layersWithData
      .merge(enteredLayers)
      .style("fill", (d, i) => this.zScale(d.key))
      .attr("d", <any>area);
  }

  private _drawBarsForToolTip() {
    let barScale = d3
      .scaleBand()
      .rangeRound([0, this.width])
      .domain(this.areaChartData.map((datum) => datum.date))
      .padding(0.0);

    this.canvas
      .selectAll(".bar") //redraw every time
      .remove();

    this.canvas
      .selectAll(".bar")
      .data(this.areaChartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d: any) => barScale(d.date))
      .style("opacity", "0.0")
      .attr("y", 0)
      .attr("width", barScale.bandwidth())
      .attr("height", this.height);

    const tool = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tip")
      .style("opacity", 0);

    d3.selectAll(".bar")
      .on("mouseover", (d) => {
        tool.transition().duration(200).style("opacity", 1);
        tool
          .html(this._getToolTip(d))
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY + "px");
      })
      .on("mouseout", function (d) {
        tool.transition().duration(200).style("opacity", 0);
      });
  }

  private _drawLegend() {
    let legendData = _.sortBy(this.stackData, (datum) => datum.index); // ensure descending order

    const legend = d3.select(".legend").selectAll("li").data(legendData);

    console.log(this.stackData[0].index);

    legend.exit().remove();

    legend
      .enter()
      .append("li")
      .attr("class", "legend-element")
      .merge(legend as any)
      .html((d) => this._getLegendLine(d))
      .on("mouseover", (d) => d3.select("." + d.key).style("display", "inline"))
      .on("mouseout", (d) => d3.select("." + d.key).style("display", "none"))
      .on("click", (d: any) => {
        this.chartData.data.forEach((datum, i) => {
          if (datum.key === d.key) {
            this.chartData.removeDatum(i);
          }
        });
        this.draw();
      });
  }

  private _getToolTip(datum): string {
    let legendKeyMap = this.chartData.data.map((datum) => {
        return { key: datum.key, legendName: datum.legendName };
      }),
      copy = _.cloneDeep(datum);
    delete copy.date;
    let tips = _.map(copy, (v, k: string) => {
      const legendName = legendKeyMap.find((item) => item.key == k).legendName;
      return {
        key: k,
        legendName: legendName,
        index: this.stackData.find((datum) => datum.key === k).index,
      };
    });
    let sum = this.chartData.getSumForYear(datum.date);
    let sumString = `<li>Total: ${this.formatNumber(
      sum,
      this.displayOptions.valueType
    )}</li>`;
    tips.sort((a, b) =>
      b.index < a.index
        ? 1
        : b.index > a.index
        ? -1
        : b.index <= a.index
        ? 0
        : NaN
    );
    let str = tips
      .map((tip) => {
        return (
          "<li><span style='color:" +
          this.zScale(tip.key) +
          "'><i class='fa fa-circle' aria-hidden='true'></i></span>&nbsp" +
          tip.legendName +
          ": " +
          this.formatNumber(datum[tip.key], this.displayOptions.valueType) +
          "</li>"
        );
      })
      .join("");
    return (
      "<div>" +
      datum.date.getFullYear() +
      ":<br><ul class='mat-caption'>" +
      str +
      sumString +
      "</ul>"
    );
  }

  private _getLegendLine(stackDatum) {
    let legendName = this.chartData.data.find(
      (datum) => datum.key == stackDatum.key
    ).legendName;
    return (
      "<span style='color:" +
      this.zScale(stackDatum.key) +
      "'><i class='fa fa-circle' aria-hidden='true'></i></span>&nbsp" +
      legendName +
      "&nbsp;<i class='fa fa-close" +
      " " +
      stackDatum.key +
      "' style='display:none'></i>"
    );
  }

  private _transformData(typeFlag: string = ""): intAreaChartData[] {
    let resolver = function (value) {
      if (typeFlag === "POSITIVE") {
        return value > 0 ? value : 0;
      } else if (typeFlag === "NEGATIVE") {
        return value < 0 ? value : 0;
      } else return value;
    };

    this.chartData.setMissingValsToZero();

    return _.chain(this.chartData.data)
      .flatMap((datum) => datum.data)
      .groupBy("fiscal_year")
      .map((v, k) => {
        return v.reduce(
          (prev, curr): any => {
            return Object.assign(prev, { [curr.key]: resolver(curr.value) });
          },
          { date: new Date(k) }
        );
      })
      .value();
  }
}
