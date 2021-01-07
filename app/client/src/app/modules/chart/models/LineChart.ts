import { BaseChart } from "./BaseChart";
import { ChartExport } from "../../../../../../server/src/modules/ChartExporter";
import * as d3 from "d3";
import * as _ from "lodash";

export class LineChart extends BaseChart {
  //todo:fix typings
  xAxis: any;
  yAxis: any;
  xGrid: any;
  yGrid: any;
  constructor(data: ChartExport, selector: string, overrides: any) {
    super(data, selector, overrides);
  }

  build() {
    //1 px so axis line is visible
    this.xScale = d3.scaleTime().range([1, this.width]);
    this.yScale = d3.scaleLinear().range([this.height, 0]);

    this.xAxis = d3.axisBottom(this.xScale).tickFormat((x) => this.formatAY(x));

    this.canvas
      .append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + this.height + ")");

    this.xGrid = d3
      .axisBottom(this.xScale)
      .tickSizeInner(-this.height)
      .tickFormat((x) => "");

    this.yAxis = d3
      .axisLeft(this.yScale)
      .tickFormat((x) =>
        this.formatNumber(x, this.displayOptions.valueType).replace(/\.00/, "")
      );

    this.canvas.append("g").attr("class", "axis axis--y");

    this.yGrid = d3
      .axisLeft(this.yScale)
      .tickSizeInner(-this.width)
      .tickFormat((x) => "");

    this.canvas.append("g").attr("class", "grid y-grid").style("opacity", 0.5);

    this.draw();
  }

  draw() {
    let that = this;

    let dateRange = this.chartData.getDateRange();
    this.xScale.domain(d3.extent(dateRange));
    let tickNumber = dateRange.length > 20 ? 20 : dateRange.length;

    this.xAxis.ticks(tickNumber);

    this.yScale.domain([this.chartData.getMin(), this.chartData.getMax()]);

    //ensure uniform order of tooltips, etc.
    this.chartData.data.sort((a, b) => {
      let aSum = a.data.reduce((a, b) => a + b.value, 0),
        bSum = b.data.reduce((a, b) => a + b.value, 0);
      return aSum > bSum ? -1 : 1;
    });

    this.formatAxes();

    const line: d3.Line<any> = d3
        .line()
        .x((d: any) => this.xScale(d.fiscal_year))
        .y((d: any) => this.yScale(d.value)),
      paths = this.canvas
        .selectAll(".path")
        .data(this.chartData.data, (d: any) => d.key),
      removedPaths = paths.exit().remove(),
      enteredPaths = paths.enter().append("path").attr("class", "path");

    enteredPaths
      .merge(paths as any)
      .attr("d", (d) => line(d.data))
      .style("stroke-width", 2)
      .style("stroke", (d) => that.zScale(d.key))
      .style("opacity", 0)
      .style("opacity", 1);

    const tool = d3
        .select("body")
        .append("div")
        .attr("class", "d3-tip")
        .style("opacity", 0),
      circles = this.canvas.selectAll(".circle"),
      circlesWithData = circles.data(this.chartData.data, (d: any) => d.key),
      removedCircles = circlesWithData.exit().remove(),
      enteredCircles = circlesWithData
        .enter()
        .append("g")
        .attr("class", "circle");

    circlesWithData.merge(enteredCircles).each(function (item) {
      let circles = d3
        .select(this)
        .selectAll(".circle")
        .data(item.data, (d: any) => d.key);
      let exited = circles.exit().remove();
      let circlesEntered = circles
        .enter()
        .append("circle")
        .attr("class", "circle");
      circles
        .merge(circlesEntered)
        .attr("r", 4)
        .attr("cx", (d) => that.xScale(d.fiscal_year))
        .attr("cy", (d) => that.yScale(d.value))
        .style("stroke", (d) => that.zScale(d.key))
        .style("fill", (d) => that.zScale(d.key))
        .on("mouseover", (d) => {
          tool.transition().duration(200).style("opacity", 1);
          tool
            .html(that.getToolTip(d.fiscal_year))
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 10 + "px");
        })
        .on("mouseout", function (d) {
          tool.transition().duration(200).style("opacity", 0);
        });
    });

    d3.selectAll("text").attr("font-size", "12");

    const legend = d3
      .select(".legend")
      .selectAll("li")
      .data(this.chartData.data);

    legend.exit().remove();

    legend
      .enter()
      .append("li")
      .attr("class", "legend-element")
      .merge(legend as any)
      .html(
        (d, i) =>
          "<span style='color:" +
          this.zScale(d.key) +
          "'><i class='fa fa-circle'></i></span> " +
          d.legendName +
          "&nbsp;<i class='fa fa-close" +
          " " +
          d.key +
          "' style='display:none'></i>"
      )
      .on("mouseover", (d) => d3.select("." + d.key).style("display", "inline"))
      .on("mouseout", (d) => d3.select("." + d.key).style("display", "none"))
      .on("click", (data) => {
        this.chartData.data.forEach((datum, i) => {
          if (datum.legendName === data.legendName) {
            this.chartData.removeDatum(i);
          }
        });
        this.draw();
      });
  }

  getToolTip(fiscal_year: Date): string {
    let everything = _.flatMap(this.chartData.data, (datum) => datum.data),
      forYear = everything.filter(
        (item) => item.fiscal_year.getFullYear() === fiscal_year.getFullYear()
      ),
      sum = forYear.reduce((a, b) => a + b.value, 0),
      str = forYear
        .map(
          (item) =>
            `<li><span style='color: ${this.zScale(
              item.key
            )}'><i class='fa fa-circle' aria-hidden='true'></i></span> ${
              item.legendName
            } : ${this.formatNumber(
              item.value,
              this.displayOptions.valueType
            )}</li>`
        )
        .join("");
    return "<ul class='mat-caption'>" + str + "<ul>";
  }
}
